import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function UploadNote() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', subject: '', topic: '', semester: '', college: '', course: '', branch: '', professor: '', description: '', tags: '',
  });
  const [file, setFile] = useState(null);
  const [declared, setDeclared] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | done
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!file) return setError('Please select a file (PDF, JPG, JPEG or PNG).');
    if (!declared) return setError('You must accept the originality declaration.');

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append('declarationAccepted', 'true');
    data.append('file', file);

    setStatus('uploading');
    try {
      setStatus('processing');
      const res = await api.post('/notes', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data.note);
      setStatus('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
      setStatus('idle');
    }
  }

  if (status === 'processing') {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-white p-8 rounded-xl border border-gray-200 text-center">
        <h2 className="text-xl font-bold mb-4">Processing your note...</h2>
        <ul className="text-left text-sm text-gray-600 space-y-2">
          <li>✓ File uploaded</li>
          <li>✓ File validated</li>
          <li>⏳ Running AI analysis (academic check, quality, duplicates)...</li>
        </ul>
      </div>
    );
  }

  if (status === 'done' && result) {
    const statusMessages = {
      published: { emoji: '✅', title: 'AI Verified & Published!', color: 'text-green-600' },
      needs_improvement: { emoji: '⚠️', title: 'Needs Improvement', color: 'text-yellow-600' },
      rejected: { emoji: '❌', title: 'Could Not Be Verified', color: 'text-red-600' },
    };
    const s = statusMessages[result.status] || statusMessages.needs_improvement;

    return (
      <div className="max-w-lg mx-auto mt-16 bg-white p-8 rounded-xl border border-gray-200">
        <div className="text-center mb-4">
          <div className="text-4xl">{s.emoji}</div>
          <h2 className={`text-xl font-bold mt-2 ${s.color}`}>{s.title}</h2>
        </div>
        <p className="text-sm text-gray-600 mb-2">Quality score: <strong>{result.ai.qualityScore}/100</strong></p>
        {result.ai.reasons?.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700">Notes from AI review:</p>
            <ul className="text-sm text-gray-500 list-disc list-inside">
              {result.ai.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
        {result.ai.suggestions?.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700">Suggestions:</p>
            <ul className="text-sm text-gray-500 list-disc list-inside">
              {result.ai.suggestions.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
        <div className="flex gap-3">
          {result.status === 'published' && (
            <button onClick={() => navigate(`/notes/${result._id}`)} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
              View Note
            </button>
          )}
          <button onClick={() => navigate('/my-notes')} className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold">
            Go to My Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Upload Notes</h1>
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <input required placeholder="Title *" value={form.title} onChange={(e) => update('title', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Subject *" value={form.subject} onChange={(e) => update('subject', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2" />
          <input placeholder="Chapter / Topic" value={form.topic} onChange={(e) => update('topic', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input placeholder="Semester" value={form.semester} onChange={(e) => update('semester', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2" />
          <input placeholder="Course" value={form.course} onChange={(e) => update('course', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2" />
          <input placeholder="Branch" value={form.branch} onChange={(e) => update('branch', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <input placeholder="College / University" value={form.college} onChange={(e) => update('college', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <input placeholder="Professor (optional)" value={form.professor} onChange={(e) => update('professor', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <textarea placeholder="Description" value={form.description} onChange={(e) => update('description', e.target.value)}
          rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <input placeholder="Tags / keywords, comma separated" value={form.tags} onChange={(e) => update('tags', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2" />

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">File (PDF, JPG, JPEG, PNG — max 20MB) *</label>
          <input required type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        <label className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <input type="checkbox" checked={declared} onChange={(e) => setDeclared(e.target.checked)} className="mt-1" />
          I confirm that these notes are my own work or that I have permission to share them, and they
          do not knowingly violate someone else's copyright.
        </label>

        <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg">
          Upload & Verify with AI
        </button>
      </form>
    </div>
  );
}
