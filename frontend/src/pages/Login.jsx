import { motion } from 'framer-motion';
import { FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { createRytaHubFolder, initDrive } from '../services/driveService';
import ThreeBackground from '../components/ThreeBackground';

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
      localStorage.setItem("googleAccessToken", accessToken);
      localStorage.setItem("user", JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }));
      initDrive(accessToken);
      await createRytaHubFolder();
      navigate("/chat");
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0F]">
      <ThreeBackground />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass relative z-10 w-full max-w-md rounded-[32px] border border-white/10 p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] text-3xl font-black text-white">R</div>
          <h1 className="mt-6 text-4xl font-black tracking-[0.2em] text-white neon-text">RYTA HUB</h1>
          <p className="mt-3 text-lg text-purple-300">Your real Gmail. Zero limits.</p>
          <p className="mt-4 text-sm text-gray-400">We save your chats to your Google Drive automatically.</p>
        </div>

        <button onClick={handleGoogleLogin} className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-4 font-semibold text-[#0A0A0F] shadow-lg transition hover:-translate-y-1 hover:shadow-purple-500/20">
          <FaGoogle /> Continue with Google
        </button>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#13131A]/80 p-4 text-center text-sm text-gray-400">
          Secure sign-in • Real profile photo • Drive sync enabled
        </div>
      </motion.div>
    </div>
  );
}
