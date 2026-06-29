import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import History from './pages/History';
import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const protectedRoutes = useMemo(
    () => (
      <>
        <Route path="/chat" element={user ? <Chat user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/history" element={user ? <History user={user} /> : <Navigate to="/login" replace />} />
      </>
    ),
    [user]
  );

  if (loading) {
    return <div className="min-h-screen bg-dark text-white flex items-center justify-center">Loading RYTA HUB...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to="/chat" replace /> : <Login />} />
      {protectedRoutes}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
