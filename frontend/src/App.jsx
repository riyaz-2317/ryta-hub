import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import History from './pages/History';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';

const AnimatedRoute = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="min-h-screen">
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F] text-white">
        <div className="w-64 rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-purple-500/40" />
          <div className="h-3 animate-pulse rounded-full bg-white/20" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedRoute><Landing /></AnimatedRoute>} />
        <Route path="/login" element={user ? <Navigate to="/chat" replace /> : <AnimatedRoute><Login /></AnimatedRoute>} />
        {protectedRoutes}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
