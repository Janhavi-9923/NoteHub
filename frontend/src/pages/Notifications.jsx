import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Notifications() {
  const [items, setItems] = useState([]);

  function load() { api.get('/notifications').then((res) => setItems(res.data.notifications)); }
  useEffect(() => { load(); }, []);

  async function markAll() {
    await api.post('/notifications/read-all');
    load();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={markAll} className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg">Mark all read</button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {items.length === 0 && <p className="p-6 text-sm text-gray-500">No notifications yet.</p>}
        {items.map((n) => (
          <div key={n._id} className={`p-4 ${!n.isRead ? 'bg-brand-50/40' : ''}`}>
            <p className="text-sm text-gray-800">{n.message}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
