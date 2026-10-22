import { useAuth } from '../context/AuthContext';
import BadgeChip from '../components/BadgeChip';

const ALL_BADGES = [
  { key: 'KNOWLEDGE_SHARER', name: 'Knowledge Sharer', desc: 'Publish your first AI-verified note.' },
  { key: 'CONSISTENT_CONTRIBUTOR', name: 'Consistent Contributor', desc: 'Publish 3 or more notes.' },
  { key: 'QUALITY_CONTRIBUTOR', name: 'Quality Contributor', desc: 'Maintain a 4★+ average across 3+ rated notes.' },
  { key: 'HELPFUL_SCHOLAR', name: 'Helpful Scholar', desc: 'Receive 10+ total ratings across your notes.' },
  { key: 'TOP_CONTRIBUTOR', name: 'Top Contributor', desc: 'Reach the top 3 on the overall leaderboard.' },
];

export default function Badges() {
  const { user } = useAuth();
  const owned = new Set((user?.badges || []).map((b) => b.key));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Badges</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {ALL_BADGES.map((b) => (
          <div key={b.key} className={`bg-white border rounded-xl p-5 ${owned.has(b.key) ? 'border-brand-300' : 'border-gray-200 opacity-60'}`}>
            <BadgeChip badge={b} />
            <p className="text-sm text-gray-500 mt-2">{b.desc}</p>
            <p className="text-xs mt-2 font-semibold">{owned.has(b.key) ? '✅ Earned' : '🔒 Not earned yet'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
