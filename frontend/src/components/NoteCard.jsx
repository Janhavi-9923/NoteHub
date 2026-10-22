import { Link } from 'react-router-dom';

const statusColor = {
  passed: 'bg-green-100 text-green-700',
  needs_improvement: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-600',
};

export default function NoteCard({ note }) {
  return (
    <Link
      to={`/notes/${note._id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-brand-200 transition"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{note.title}</h3>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[note.ai?.status] || statusColor.pending}`}>
          {note.ai?.status === 'passed' ? 'AI Verified' : note.ai?.status || 'Processing'}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">{note.subject} {note.topic ? `• ${note.topic}` : ''}</p>
      <p className="text-xs text-gray-400 mt-1">{note.college} {note.branch ? `• ${note.branch}` : ''} {note.semester ? `• Sem ${note.semester}` : ''}</p>
      <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
        <span>By {note.owner?.name || 'Unknown'}</span>
        <div className="flex items-center gap-3">
          <span>⭐ {note.ratingAvg?.toFixed?.(1) || '0.0'} ({note.ratingCount || 0})</span>
          <span>👁 {note.views || 0}</span>
          <span>⬇ {note.downloads || 0}</span>
        </div>
      </div>
    </Link>
  );
}
