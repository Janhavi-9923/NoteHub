import { useEffect, useState } from 'react';
import api from '../api/axios';
import BadgeChip from '../components/BadgeChip';

export default function Recognition() {
  const [overall, setOverall] = useState([]);
  const [monthly, setMonthly] = useState([]);

  useEffect(() => {
    api.get('/leaderboard/overall').then((res) => setOverall(res.data.leaderboard.slice(0, 3)));
    api.get('/leaderboard/monthly').then((res) => setMonthly(res.data.leaderboard.slice(0, 3)));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Recognition</h1>
      <p className="text-gray-500 text-sm mb-8">Celebrating NoteHub's most valuable contributors — non-monetary recognition only.</p>

      <h2 className="font-bold text-lg mb-3">🏆 Featured Contributors (All-Time)</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {overall.map((u, i) => (
          <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <div className="text-3xl">{['🥇', '🥈', '🥉'][i]}</div>
            <div className="font-bold mt-2">{u.name}</div>
            <div className="text-xs text-gray-400">{u.college}</div>
            <div className="text-brand-600 font-semibold mt-1">{u.points} pts</div>
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {u.badges?.map((b) => <BadgeChip key={b.key} badge={b} />)}
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-bold text-lg mb-3">📅 Monthly Recognition</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {monthly.length === 0 && <p className="text-sm text-gray-500">No contributions yet this month.</p>}
        {monthly.map((u, i) => (
          <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <div className="text-2xl">🎖️</div>
            <div className="font-bold mt-2">{u.name}</div>
            <div className="text-brand-600 font-semibold mt-1">{u.points} pts this month</div>
          </div>
        ))}
      </div>
    </div>
  );
}
