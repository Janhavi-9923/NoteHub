import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <section className="max-w-5xl mx-auto text-center pt-20 pb-16 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          Share notes. Earn recognition. <span className="text-brand-600">Not money.</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          NoteHub is an AI-verified academic notes sharing platform. Upload your notes,
          help fellow students, and climb the leaderboard through points and badges.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/notes" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg">
            Browse Notes
          </Link>
          <Link to="/signup" className="bg-white border border-gray-300 hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg">
            Get Started
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto grid md:grid-cols-4 gap-6 px-4 pb-20">
        {[
          ['📤', 'Upload', 'Share your notes with metadata & an originality declaration.'],
          ['🤖', 'AI Verified', 'Every note is checked for quality, relevance & duplicates.'],
          ['🏅', 'Earn Points', 'Get points for verified uploads and helpful reviews.'],
          ['🏆', 'Get Recognized', 'Unlock badges and climb the leaderboard.'],
        ].map(([icon, title, desc]) => (
          <div key={title} className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
