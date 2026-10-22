import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

export default function NoteDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [note, setNote] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState('');
  const [accessed, setAccessed] = useState(false);
  const [message, setMessage] = useState('');
  const [reportReason, setReportReason] = useState('');

  function load() {
    api.get(`/notes/${id}`).then((res) => setNote(res.data.note));
    api.get(`/notes/${id}/reviews`).then((res) => setReviews(res.data.reviews));
  }

  useEffect(() => { load(); }, [id]);

  async function handleAccess() {
    try {
      const res = await api.get(`/notes/${id}/access`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = note.originalFileName || 'note';
      a.click();
      setAccessed(true);
      setMessage('File downloaded. You can now rate/review this note.');
      load();
    } catch (err) {
      setMessage('You must be logged in to access this note.');
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    try {
      await api.post(`/notes/${id}/reviews`, { rating: myRating, text: myText });
      setMessage('Thanks for your review!');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not submit review.');
    }
  }

  async function submitReport() {
    if (!reportReason) return;
    await api.post(`/notes/${id}/report`, { reason: reportReason });
    setMessage('Report submitted. Thank you.');
    setReportReason('');
  }

  if (!note) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const isOwner = user && note.owner?._id === user.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">{note.title}</h1>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
            {note.ai?.status === 'passed' ? 'AI Verified' : note.ai?.status}
          </span>
        </div>
        <p className="text-gray-500 mt-1">{note.subject} {note.topic && `• ${note.topic}`}</p>
        <p className="text-sm text-gray-400 mt-1">
          {note.college} {note.branch && `• ${note.branch}`} {note.semester && `• Sem ${note.semester}`} {note.professor && `• Prof. ${note.professor}`}
        </p>
        {note.description && <p className="mt-4 text-gray-700">{note.description}</p>}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {note.tags.map((t) => <span key={t} className="text-xs bg-gray-100 px-2 py-1 rounded-full">#{t}</span>)}
          </div>
        )}

        <div className="flex items-center gap-6 mt-5 text-sm text-gray-500">
          <span>By {note.owner?.name}</span>
          <span>⭐ {note.ratingAvg?.toFixed(1)} ({note.ratingCount})</span>
          <span>👁 {note.views} views</span>
          <span>⬇ {note.downloads} downloads</span>
        </div>

        {message && <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-lg mt-4">{message}</div>}

        <div className="mt-6 flex gap-3">
          {!isOwner && <button onClick={handleAccess} className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-lg">Access / Download</button>}
          {!isOwner && user && (
            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Report this note...</option>
              <option value="irrelevant">Irrelevant</option>
              <option value="poor_quality">Poor quality</option>
              <option value="duplicate">Duplicate / similar</option>
              <option value="suspicious">Suspicious</option>
              <option value="incorrect_information">Incorrect information</option>
              <option value="copyright_concern">Copyright concern</option>
            </select>
          )}
          {reportReason && <button onClick={submitReport} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold">Submit Report</button>}
        </div>
      </div>

      {!isOwner && user && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6">
          <h2 className="font-bold mb-3">Rate & Review</h2>
          <form onSubmit={submitReview} className="space-y-3">
            <StarRating value={myRating} onChange={setMyRating} />
            <textarea placeholder="Write a short review (optional)" value={myText} onChange={(e) => setMyText(e.target.value)}
              rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Submit Review</button>
            <p className="text-xs text-gray-400">You must access/download the note before your review can be submitted.</p>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6">
        <h2 className="font-bold mb-3">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? <p className="text-sm text-gray-500">No reviews yet.</p> : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{r.user?.name}</span>
                  <StarRating value={r.rating} size="text-sm" />
                </div>
                {r.text && <p className="text-sm text-gray-600 mt-1">{r.text}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
