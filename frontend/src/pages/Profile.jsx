import { useAuth } from '../context/AuthContext';
import BadgeChip from '../components/BadgeChip';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-gray-500">{user.email}</p>
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div><span className="text-gray-400">College:</span> {user.college || '-'}</div>
          <div><span className="text-gray-400">Course:</span> {user.course || '-'}</div>
          <div><span className="text-gray-400">Branch:</span> {user.branch || '-'}</div>
          <div><span className="text-gray-400">Semester:</span> {user.semester || '-'}</div>
        </div>
        <div className="mt-4 text-lg font-bold text-brand-600">{user.points} points</div>
        <div className="flex flex-wrap gap-2 mt-3">
          {user.badges?.map((b) => <BadgeChip key={b.key} badge={b} />)}
        </div>
      </div>
    </div>
  );
}
