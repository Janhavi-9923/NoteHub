import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '', course: '', branch: '', semester: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl border border-gray-200">
      <h1 className="text-2xl font-bold mb-1">Create your account</h1>
      <p className="text-gray-500 mb-6 text-sm">Join NoteHub to share and discover notes.</p>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input required placeholder="Full name" value={form.name} onChange={(e) => update('name', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <input required type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => update('password', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <input placeholder="College / University" value={form.college} onChange={(e) => update('college', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="Course" value={form.course} onChange={(e) => update('course', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          <input placeholder="Branch" value={form.branch} onChange={(e) => update('branch', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <input placeholder="Semester" value={form.semester} onChange={(e) => update('semester', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2" />

        <button disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        Already have an account? <Link to="/login" className="text-brand-600 font-medium">Log in</Link>
      </p>
    </div>
  );
}
