import { useEffect, useState } from 'react';
import api from '../api/axios';
import BadgeChip from '../components/BadgeChip';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/dashboard').then((res) => setData(res.data)); }, []);

  if (!data) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  const { stats, badges, recentUploads, recentReviews, pointHistory } = data;

  const cards = [
    ['Total Uploads', stats.totalUploads],
    ['Published', stats.totalPublished],
    ['Total Views', stats.totalViews],
    ['Total Downloads', stats.totalDownloads],
    ['Avg. Rating', stats.avgRating],
    ['Points', stats.points],
    ['Rank', stats.rank ? `#${stats.rank}` : '-'],
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(([label, value]) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-brand-600">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold mb-3">Your Badges</h2>
          <div className="flex flex-wrap gap-2">
            {badges.length === 0 ? <p className="text-sm text-gray-500">No badges yet — publish your first note!</p> :
              badges.map((b) => <BadgeChip key={b.key} badge={b} />)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold mb-3">Recent Point History</h2>
          {pointHistory.length === 0 ? <p className="text-sm text-gray-500">No points earned yet.</p> : (
            <ul className="text-sm space-y-2">
              {pointHistory.map((p) => (
                <li key={p._id} className="flex justify-between">
                  <span className="text-gray-600">{p.reason.replaceAll('_', ' ').toLowerCase()}</span>
                  <span className="font-semibold text-green-600">+{p.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold mb-3">Recent Uploads</h2>
          {recentUploads.length === 0 ? <p className="text-sm text-gray-500">No uploads yet.</p> : (
            <ul className="text-sm space-y-2">
              {recentUploads.map((n) => (
                <li key={n._id} className="flex justify-between">
                  <span>{n.title}</span>
                  <span className="text-gray-400 text-xs">{n.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-bold mb-3">Recent Reviews Received</h2>
          {recentReviews.length === 0 ? <p className="text-sm text-gray-500">No reviews yet.</p> : (
            <ul className="text-sm space-y-2">
              {recentReviews.map((r) => (
                <li key={r._id}>
                  <span className="font-medium">{r.user?.name}</span> rated <span className="italic">{r.note?.title}</span> {r.rating}★
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
