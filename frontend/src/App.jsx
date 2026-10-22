import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotesLibrary from './pages/NotesLibrary';
import NoteDetails from './pages/NoteDetails';
import UploadNote from './pages/UploadNote';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Recognition from './pages/Recognition';
import Badges from './pages/Badges';
import Profile from './pages/Profile';
import MyNotes from './pages/MyNotes';
import MyDownloads from './pages/MyDownloads';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/notes" element={<NotesLibrary />} />
          <Route path="/notes/:id" element={<NoteDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/recognition" element={<Recognition />} />
          <Route path="/upload" element={<ProtectedRoute><UploadNote /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-notes" element={<ProtectedRoute><MyNotes /></ProtectedRoute>} />
          <Route path="/my-downloads" element={<ProtectedRoute><MyDownloads /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
