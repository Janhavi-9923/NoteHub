import { useEffect, useState } from 'react';
import api from '../api/axios';
import BadgeChip from '../components/BadgeChip';

export default function Leaderboard() {
  const [scope, setScope] = useState('overall');
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get(`/leaderboard/${scope}`).then((res) => setList(res.data.leaderboard));
  }, [scope]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
      <p className="text-gray-500 text-sm mb-6">Ranked by contribution points — not marks, not upload count alone.</p>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setScope('overall')} className={`px-4 py-1.5 rounded-full text-sm font-medium ${scope === 'overall' ? 'bg-brand-600 text-white' : 'bg-gray-100'}`}>Overall</button>
        <button onClick={() => setScope('monthly')} className={`px-4 py-1.5 rounded-full text-sm font-medium ${scope === 'monthly' ? 'bg-brand-600 text-white' : 'bg-gray-100'}`}>This Month</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {list.length === 0 && <p className="p-6 text-sm text-gray-500">No data yet.</p>}
        {list.map((entry, i) => (
          <div key={entry.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <span className="w-8 text-center font-bold text-gray-400">#{i + 1}</span>
              <div>
                <div className="font-semibold">{entry.name}</div>
                <div className="text-xs text-gray-400">{entry.college}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex gap-1">
                {entry.badges?.slice(0, 3).map((b) => <BadgeChip key={b.key} badge={b} />)}
              </div>
              <span className="font-bold text-brand-600">{entry.points} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
