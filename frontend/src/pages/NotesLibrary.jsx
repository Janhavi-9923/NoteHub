import { useEffect, useState } from 'react';
import api from '../api/axios';
import NoteCard from '../components/NoteCard';

export default function NotesLibrary() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', subject: '', semester: '', branch: '', sort: 'newest', aiVerified: '' });

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    setLoading(true);
    api.get('/notes', { params }).then((res) => setNotes(res.data.notes)).finally(() => setLoading(false));
  }, [filters]);

  function update(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Browse Notes</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Search title, subject, topic, tags..."
          value={filters.q}
          onChange={(e) => update('q', e.target.value)}
          className="flex-1 min-w-[220px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <input placeholder="Subject" value={filters.subject} onChange={(e) => update('subject', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32" />
        <input placeholder="Semester" value={filters.semester} onChange={(e) => update('semester', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28" />
        <input placeholder="Branch" value={filters.branch} onChange={(e) => update('branch', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32" />
        <select value={filters.sort} onChange={(e) => update('sort', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="downloads">Most Downloaded</option>
          <option value="rating">Top Rated</option>
          <option value="views">Most Viewed</option>
        </select>
        <label className="flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-2">
          <input type="checkbox" checked={filters.aiVerified === 'true'} onChange={(e) => update('aiVerified', e.target.checked ? 'true' : '')} />
          AI Verified only
        </label>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-500">No notes found. Try different filters, or be the first to upload!</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {notes.map((note) => <NoteCard key={note._id} note={note} />)}
        </div>
      )}
    </div>
  );
}
