import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const statusLabel = {
  processing: ['Processing', 'bg-gray-100 text-gray-600'],
  published: ['Published', 'bg-green-100 text-green-700'],
  needs_improvement: ['Needs Improvement', 'bg-yellow-100 text-yellow-700'],
  rejected: ['Rejected', 'bg-red-100 text-red-700'],
  unpublished: ['Unpublished', 'bg-gray-100 text-gray-500'],
};

export default function MyNotes() {
  const [notes, setNotes] = useState([]);

  function load() { api.get('/notes/mine/list').then((res) => setNotes(res.data.notes)); }
  useEffect(() => { load(); }, []);

  async function handleUnpublish(id) {
    await api.post(`/notes/${id}/unpublish`);
    load();
  }
  async function handleDelete(id) {
    if (!confirm('Delete this note permanently?')) return;
    await api.delete(`/notes/${id}`);
    load();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Notes</h1>
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {notes.length === 0 && <p className="p-6 text-sm text-gray-500">You haven't uploaded any notes yet.</p>}
        {notes.map((n) => {
          const [label, cls] = statusLabel[n.status] || statusLabel.processing;
          return (
            <div key={n._id} className="p-4 flex items-center justify-between">
              <div>
                <Link to={`/notes/${n._id}`} className="font-semibold hover:text-brand-600">{n.title}</Link>
                <p className="text-xs text-gray-400">{n.subject} • {n.views} views • {n.downloads} downloads</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${cls}`}>{label}</span>
                {n.status === 'published' && (
                  <button onClick={() => handleUnpublish(n._id)} className="text-xs bg-gray-100 px-2 py-1 rounded-lg">Unpublish</button>
                )}
                <button onClick={() => handleDelete(n._id)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
