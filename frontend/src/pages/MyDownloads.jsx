import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function MyDownloads() {
  const [accesses, setAccesses] = useState([]);
  useEffect(() => { api.get('/notes/mine/downloads').then((res) => setAccesses(res.data.accesses)); }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Downloads</h1>
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {accesses.length === 0 && <p className="p-6 text-sm text-gray-500">You haven't accessed any notes yet.</p>}
        {accesses.map((a) => a.note && (
          <div key={a._id} className="p-4 flex items-center justify-between">
            <div>
              <Link to={`/notes/${a.note._id}`} className="font-semibold hover:text-brand-600">{a.note.title}</Link>
              <p className="text-xs text-gray-400">By {a.note.owner?.name} • Accessed {new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
            <Link to={`/notes/${a.note._id}`} className="text-xs bg-brand-50 text-brand-700 px-3 py-1.5 rounded-lg font-semibold">
              View / Review
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
