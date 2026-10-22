const fs = require('fs');
const path = require('path');
const Note = require('../models/Note');

/*
  AIService — architecture explanation (also see README):

  processNote() is the single function the rest of the app calls.
  Internally it picks a "provider":
    - MockAIProvider: works with ZERO setup, deterministic, clearly labelled as demo/mock.
    - RealAIProvider: calls a real AI API (only used if AI_PROVIDER=openai AND AI_API_KEY is set).

  This way, the rest of the codebase never knows or cares which one ran —
  it just gets back a consistent result shape.
*/

// ---------- helpers shared by both providers ----------

const SUBJECT_KEYWORDS = {
  Mathematics: ['calculus', 'algebra', 'matrix', 'derivative', 'integral', 'theorem', 'geometry'],
  'Computer Science': ['algorithm', 'data structure', 'operating system', 'database', 'network', 'programming', 'code'],
  Physics: ['force', 'energy', 'quantum', 'thermodynamics', 'motion', 'wave', 'electric'],
  Chemistry: ['reaction', 'compound', 'molecule', 'acid', 'base', 'organic', 'element'],
  Biology: ['cell', 'gene', 'organism', 'evolution', 'anatomy', 'ecosystem'],
  Economics: ['demand', 'supply', 'market', 'inflation', 'gdp', 'economy'],
};

function guessSubjectFromText(text) {
  const lower = text.toLowerCase();
  let best = { subject: '', score: 0 };
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    const score = keywords.filter((k) => lower.includes(k)).length;
    if (score > best.score) best = { subject, score };
  }
  return best.subject;
}

function extractKeywords(...texts) {
  const text = texts.join(' ').toLowerCase();
  const words = text.match(/[a-z]{4,}/g) || [];
  const stop = new Set(['this', 'that', 'with', 'from', 'have', 'notes', 'note', 'about', 'these', 'their']);
  const freq = {};
  for (const w of words) {
    if (stop.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);
}

// Very light-weight "near duplicate" check: compares the new note's
// title+subject+tags against existing published notes using word overlap
// (Jaccard similarity). This is intentionally simple and explainable —
// swap in a real embeddings-based comparison later if you want.
async function findNearDuplicate(note) {
  const candidateWords = new Set(
    `${note.title} ${note.subject} ${note.topic} ${(note.tags || []).join(' ')}`.toLowerCase().match(/[a-z]{3,}/g) || []
  );
  if (candidateWords.size === 0) return null;

  const others = await Note.find({
    status: 'published',
    subject: note.subject,
    _id: { $ne: note._id },
  }).limit(50);

  let best = { note: null, similarity: 0 };
  for (const other of others) {
    const otherWords = new Set(
      `${other.title} ${other.subject} ${other.topic} ${(other.tags || []).join(' ')}`.toLowerCase().match(/[a-z]{3,}/g) || []
    );
    const intersection = [...candidateWords].filter((w) => otherWords.has(w)).length;
    const union = new Set([...candidateWords, ...otherWords]).size;
    const similarity = union === 0 ? 0 : intersection / union;
    if (similarity > best.similarity) best = { note: other, similarity };
  }

  const NEAR_DUPLICATE_THRESHOLD = 0.6; // configurable
  if (best.similarity >= NEAR_DUPLICATE_THRESHOLD) return best;
  return null;
}

// ---------- MockAIProvider ----------
// A clearly-labelled DEMO provider. It never claims to be a "real" AI verification.
// It uses simple, deterministic, explainable rules so behaviour is predictable
// while you build the rest of the app.
const MockAIProvider = {
  name: 'mock',

  async analyze(note, filePath) {
    const stats = fs.statSync(filePath);
    const fileSizeKB = stats.size / 1024;

    // Try to read a little bit of the file as text (works reasonably for
    // text-heavy PDFs saved as plain text; for real PDF text extraction,
    // add the "pdf-parse" package later and swap this out).
    let sampleText = `${note.title} ${note.subject} ${note.topic} ${note.description} ${(note.tags || []).join(' ')}`;

    const detectedSubject = guessSubjectFromText(sampleText) || note.subject;
    const keywords = extractKeywords(note.title, note.description, note.topic, (note.tags || []).join(' '));

    // Quality score: a simple, explainable heuristic combining several signals.
    let score = 50;
    if (note.description && note.description.length > 40) score += 15;
    if ((note.tags || []).length >= 2) score += 10;
    if (fileSizeKB > 20) score += 10; // not suspiciously tiny/empty
    if (note.topic) score += 10;
    if (note.title.length > 8) score += 5;
    score = Math.max(0, Math.min(100, score));

    const isAcademic = note.title.length > 2 && note.subject.length > 1; // trivial placeholder check

    const reasons = [];
    const suggestions = [];

    if (!isAcademic) {
      reasons.push('Could not confirm this is academic content.');
      suggestions.push('Make sure the title and subject clearly describe the academic topic.');
    }
    if (score < 60) {
      reasons.push('Quality score is below the acceptable threshold.');
      suggestions.push('Add a longer description and more specific tags/keywords.');
    }
    if (fileSizeKB < 5) {
      reasons.push('The file seems unusually small — it may be empty or corrupted.');
      suggestions.push('Double-check the file opens correctly before re-uploading.');
    }

    return {
      provider: 'mock',
      qualityScore: score,
      isAcademic,
      detectedSubject,
      extractedKeywords: keywords,
      reasons,
      suggestions,
    };
  },
};

// ---------- RealAIProvider ----------
// Only used when AI_PROVIDER=openai and AI_API_KEY is set in .env.
// This calls a real hosted AI model to do the same job with far better judgment.
const RealAIProvider = {
  name: 'real',

  async analyze(note, filePath) {
    const apiKey = process.env.AI_API_KEY;
    const prompt = `You are grading a student's uploaded academic note for a notes-sharing platform.
Title: ${note.title}
Subject: ${note.subject}
Topic: ${note.topic}
Description: ${note.description}
Tags: ${(note.tags || []).join(', ')}

Respond ONLY with strict JSON, no other text, in this exact shape:
{
  "qualityScore": <number 0-100>,
  "isAcademic": <true|false>,
  "detectedSubject": "<string>",
  "extractedKeywords": ["<string>", ...],
  "reasons": ["<string>", ...],
  "suggestions": ["<string>", ...]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = (data.content || []).map((b) => b.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return { provider: 'real', ...parsed };
  },
};

// ---------- the function the rest of the app actually calls ----------

async function processNote(note, filePath) {
  const useReal = process.env.AI_PROVIDER === 'openai' && process.env.AI_API_KEY;
  // NOTE: even if AI_PROVIDER is set to something else, we always safely fall
  // back to the Mock provider so the app NEVER breaks for lack of an API key.
  const provider = useReal ? RealAIProvider : MockAIProvider;

  const result = await provider.analyze(note, filePath);
  const nearDup = await findNearDuplicate(note);

  const reasons = [...(result.reasons || [])];
  const suggestions = [...(result.suggestions || [])];
  let isDuplicateNear = false;
  let duplicateOfNoteId = null;

  if (nearDup) {
    isDuplicateNear = true;
    duplicateOfNoteId = nearDup.note._id;
    reasons.push(
      `This looks similar to an existing note: "${nearDup.note.title}" (similarity ${(nearDup.similarity * 100).toFixed(0)}%).`
    );
    suggestions.push('If your notes add new value, explain what is different in the description.');
  }

  let status;
  if (!result.isAcademic) status = 'failed';
  else if (isDuplicateNear || result.qualityScore < 60) status = 'needs_improvement';
  else status = 'passed';

  return {
    provider: result.provider,
    qualityScore: result.qualityScore,
    isAcademic: result.isAcademic,
    isDuplicateNear,
    duplicateOfNoteId,
    detectedSubject: result.detectedSubject || note.subject,
    extractedKeywords: result.extractedKeywords || [],
    reasons,
    suggestions,
    status, // "passed" | "needs_improvement" | "failed"
  };
}

module.exports = { processNote };
