import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = 'text-sm font-medium text-gray-600 hover:text-brand-600';

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-brand-600">📚 NoteHub</Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/notes" className={linkClass}>Browse Notes</Link>
          <Link to="/leaderboard" className={linkClass}>Leaderboard</Link>
          <Link to="/recognition" className={linkClass}>Recognition</Link>
          {user && <Link to="/upload" className={linkClass}>Upload</Link>}
          {user && <Link to="/dashboard" className={linkClass}>Dashboard</Link>}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/notifications" className={linkClass}>🔔</Link>
              <Link to="/profile" className="text-sm font-semibold text-brand-700">{user.name}</Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>Login</Link>
              <Link to="/signup" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
