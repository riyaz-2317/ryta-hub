import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaArchive,
  FaArrowLeft,
  FaCheck,
  FaCog,
  FaGoogleDrive,
  FaPencilAlt,
  FaSave,
  FaTrash,
  FaUpload,
  FaUserSlash,
  FaComments,
  FaRobot,
  FaLightbulb,
  FaMoon,
  FaBell,
  FaVolumeUp,
  FaGlobe,
  FaFileArchive,
  FaRocket,
  FaLink,
  FaTimesCircle,
  FaSync,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const initialSettings = {
  darkMode: true,
  chatNotifications: true,
  autoSwitchAI: true,
  autoSaveDrive: true,
  soundEffects: true,
  showAIStatus: true,
  saveChatHistory: true,
  streamingResponses: true,
};

const defaultStats = {
  totalMessages: 1280,
  favoriteAI: 'Gemini 2.5',
  chatsSaved: 248,
  limitsAvoided: 34,
};

async function persistProfileToFirestore(uid, userData, settingsData) {
  if (!uid) return;
  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        ...userData,
        settings: settingsData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to sync profile to Firestore', error);
  }
}

// Animated Counter Component
function AnimatedCounter({ from = 0, to = 0, duration = 2 }) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime;
    const interval = setInterval(() => {
      startTime = startTime || Date.now();
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      setCount(Math.floor(from + (to - from) * progress));
      if (progress === 1) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, [from, to, duration]);

  return <span>{count.toLocaleString()}</span>;
}

// Animated Toggle Switch Component
function ToggleSwitch({ checked, onChange }) {
  return (
    <motion.button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
        checked ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500' : 'bg-gray-600'
      }`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute h-6 w-6 rounded-full bg-white shadow-lg"
        style={{
          x: checked ? 32 : 4,
        }}
      />
    </motion.button>
  );
}

export default function Profile({ userProp }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return userProp || {};
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return userProp || {};
    try {
      return JSON.parse(storedUser);
    } catch {
      return userProp || {};
    }
  });

  const [displayName, setDisplayName] = useState(user?.displayName || 'RYTA HUB User');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') return initialSettings;
    try {
      const stored = localStorage.getItem('rytaSettings');
      return stored ? { ...initialSettings, ...JSON.parse(stored) } : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [stats, setStats] = useState({
    totalMessages: 0,
    favoriteAI: 'Gemini 2.5',
    chatsSaved: 0,
    limitsAvoided: 0,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const fileInputRef = useRef(null);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) {
      return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [user?.createdAt]);

  const initials = useMemo(
    () =>
      (displayName || 'RY')
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    [displayName]
  );

  // Load user data from Firebase
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser?.uid) return;

      try {
        const snapshot = await getDoc(doc(db, 'users', currentUser.uid));
        if (snapshot.exists()) {
          const data = snapshot.data();
          const nextUser = {
            uid: currentUser.uid,
            email: data.email || currentUser.email || '',
            displayName: data.displayName || currentUser.displayName || 'RYTA HUB User',
            photoURL: data.photoURL || currentUser.photoURL || '',
            createdAt: data.createdAt || new Date().toISOString(),
          };
          setUser(nextUser);
          setDisplayName(nextUser.displayName);
          setPhotoURL(nextUser.photoURL);
          localStorage.setItem('user', JSON.stringify(nextUser));

          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save settings to localStorage and Firestore
  useEffect(() => {
    localStorage.setItem('rytaSettings', JSON.stringify(settings));
    if (user?.uid) {
      persistProfileToFirestore(user.uid, user, settings);
    }
  }, [settings, user?.uid]);

  // Initialize stats from localStorage
  useEffect(() => {
    const storedStats = localStorage.getItem('rytaStats');
    if (storedStats) {
      try {
        setStats(JSON.parse(storedStats));
      } catch {
        setStats({
          totalMessages: Math.floor(Math.random() * 2000) + 500,
          favoriteAI: 'Gemini 2.5',
          chatsSaved: Math.floor(Math.random() * 500) + 50,
          limitsAvoided: Math.floor(Math.random() * 100) + 10,
        });
      }
    } else {
      setStats({
        totalMessages: Math.floor(Math.random() * 2000) + 500,
        favoriteAI: 'Gemini 2.5',
        chatsSaved: Math.floor(Math.random() * 500) + 50,
        limitsAvoided: Math.floor(Math.random() * 100) + 10,
      });
    }
  }, []);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('rytaStats', JSON.stringify(stats));
  }, [stats]);

  const handleSaveProfile = async () => {
    const updated = {
      ...user,
      uid: user?.uid || auth.currentUser?.uid,
      displayName,
      photoURL,
      email: user?.email || auth.currentUser?.email || '',
    };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2000);

    if (updated.uid) {
      await persistProfileToFirestore(updated.uid, updated, settings);
    }
  };

  const handlePhotoAction = (action) => {
    if (action === 'upload') {
      fileInputRef.current?.click();
    } else if (action === 'google') {
      setPhotoURL(user?.photoURL || '');
      setShowUploadMenu(false);
    } else if (action === 'remove') {
      setPhotoURL('');
      setShowUploadMenu(false);
    }
    setShowUploadMenu(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPhotoURL(previewUrl);
    setIsUploading(true);
    setUploadProgress(0);

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsUploading(false);
          setShowUploadMenu(false);
          const updated = {
            ...user,
            uid: user?.uid || auth.currentUser?.uid,
            photoURL: previewUrl,
          };
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
          if (updated.uid) {
            persistProfileToFirestore(updated.uid, updated, settings);
          }
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 150);

    event.target.value = '';
  };

  const toggleSetting = (key) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
  };

  const handleSyncDrive = () => {
    setSyncing(true);
    setLastSyncTime(new Date());
    setTimeout(() => setSyncing(false), 2000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('googleAccessToken');
    navigate('/login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const settingOptions = [
    { label: '🌙 Dark Mode', key: 'darkMode', locked: true },
    { label: '🔔 Chat Notifications', key: 'chatNotifications', locked: false },
    { label: '⚡ Auto-Switch AI', key: 'autoSwitchAI', locked: false },
    { label: '💾 Auto-Save to Drive', key: 'autoSaveDrive', locked: false },
    { label: '🔊 Sound Effects', key: 'soundEffects', locked: false },
    { label: '🌐 Show AI Status', key: 'showAIStatus', locked: false },
    { label: '📝 Save Chat History', key: 'saveChatHistory', locked: false },
    { label: '🚀 Streaming Responses', key: 'streamingResponses', locked: false },
  ];

  const statsCards = [
    {
      label: 'Total Messages',
      value: stats.totalMessages,
      icon: <FaComments className="text-2xl" />,
      accent: 'from-purple-500/30 to-purple-400/10',
      borderAccent: 'from-purple-500/50',
      iconColor: 'text-purple-300',
    },
    {
      label: 'Favorite AI',
      value: stats.favoriteAI,
      icon: <FaRobot className="text-2xl" />,
      accent: 'from-fuchsia-500/30 to-pink-400/10',
      borderAccent: 'from-fuchsia-500/50',
      iconColor: 'text-fuchsia-300',
    },
    {
      label: 'Chats Saved',
      value: stats.chatsSaved,
      icon: <FaArchive className="text-2xl" />,
      accent: 'from-emerald-500/30 to-green-400/10',
      borderAccent: 'from-emerald-500/50',
      iconColor: 'text-emerald-300',
    },
    {
      label: 'Limits Avoided',
      value: stats.limitsAvoided,
      icon: <FaLightbulb className="text-2xl" />,
      accent: 'from-amber-500/30 to-orange-400/10',
      borderAccent: 'from-amber-500/50',
      iconColor: 'text-amber-300',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Navigation Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 transition hover:bg-purple-500/20"
          >
            <FaArrowLeft /> Back to Chat
          </motion.button>

          <h1 className="text-center text-xl font-black tracking-widest text-white">RYTA HUB</h1>

          <div className="w-12" />
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Profile Header Section */}
          <motion.div
            variants={itemVariants}
            className="glass rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
              {/* Profile Picture */}
              <div className="flex flex-col items-center gap-4">
                {/* 3D Rotating Profile Picture */}
                <motion.div
                  onMouseEnter={() => setIsRotating(false)}
                  onMouseLeave={() => setIsRotating(true)}
                  className="relative"
                >
                  {/* Glowing Background Ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 blur-3xl opacity-40" />

                  {/* Profile Picture Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowUploadMenu((prev) => !prev)}
                    className="group relative z-10 flex h-48 w-48 items-center justify-center overflow-hidden rounded-full border-4 border-purple-400/60 shadow-[0_0_60px_rgba(124,58,237,0.5)]"
                  >
                    {/* Animated Rotating Border */}
                    <motion.div
                      animate={{ rotate: isRotating ? 360 : 0 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 border-r-fuchsia-400"
                    />

                    {/* Floating Animation */}
                    <motion.div
                      animate={{ y: [0, -12, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 rounded-full"
                    >
                      {photoURL ? (
                        <img
                          src={photoURL}
                          alt="profile"
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-800 text-6xl font-black text-white shadow-inner">
                          {initials}
                        </div>
                      )}
                    </motion.div>
                  </motion.button>

                  {/* Upload Menu */}
                  <AnimatePresence>
                    {showUploadMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute left-1/2 top-[calc(100%+1rem)] z-20 w-64 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0F0F15]/95 p-3 shadow-2xl backdrop-blur-xl"
                      >
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={() => handlePhotoAction('upload')}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-200 transition hover:bg-white/10"
                        >
                          <FaUpload className="text-purple-300" /> Upload Photo
                        </motion.button>
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={() => handlePhotoAction('google')}
                          className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-200 transition hover:bg-white/10"
                        >
                          <FaGoogleDrive className="text-blue-300" /> Use Google Photo
                        </motion.button>
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={() => handlePhotoAction('remove')}
                          className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-300 transition hover:bg-red-500/10"
                        >
                          <FaUserSlash /> Remove Photo
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Upload Progress Bar */}
                  <AnimatePresence>
                    {isUploading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -bottom-16 left-1/2 w-56 -translate-x-1/2"
                      >
                        <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
                          />
                        </div>
                        <p className="text-center text-xs text-purple-300">
                          {uploadProgress}% Uploading…
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Online Status */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.8)]"
                  />
                  <span className="text-xs text-emerald-300">Online Now</span>
                </motion.div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <motion.div variants={itemVariants}>
                  <h1 className="text-4xl font-black text-white sm:text-5xl">{displayName}</h1>
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="mt-2 text-lg text-purple-300"
                >
                  {user?.email || 'your-email@gmail.com'}
                </motion.p>

                <motion.p
                  variants={itemVariants}
                  className="mt-2 text-sm text-gray-400"
                >
                  Member since <span className="text-white font-semibold">{memberSince}</span>
                </motion.p>

                {/* Stats Grid */}
                <motion.div
                  variants={itemVariants}
                  className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                  {statsCards.map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.05 }}
                      whileHover={{
                        y: -6,
                        boxShadow: '0 20px 40px rgba(124,58,237,0.2)',
                      }}
                      className={`glass group rounded-2xl border border-white/10 bg-gradient-to-br ${stat.accent} p-4 backdrop-blur-xl transition hover:border-white/20`}
                    >
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-br ${stat.accent} p-2`}>
                        <span className={stat.iconColor}>{stat.icon}</span>
                      </div>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                      <p className="mt-1 text-lg font-bold text-white">
                        {typeof stat.value === 'number' ? (
                          <AnimatedCounter from={0} to={stat.value} duration={2} />
                        ) : (
                          stat.value
                        )}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Edit Profile & Settings Grid */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Edit Profile Card */}
            <motion.div
              variants={itemVariants}
              className="glass rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full border border-purple-400/30 bg-purple-500/10 p-3 text-purple-300">
                  <FaPencilAlt />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                  <p className="text-sm text-gray-400">Update your display name</p>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">Display Name</span>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1A1A22]/50 px-4 py-3 focus-within:border-purple-400/50 focus-within:bg-[#1A1A22]">
                  <FaPencilAlt className="text-purple-300" />
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-transparent text-white outline-none placeholder-gray-500"
                    placeholder="Your name"
                  />
                </div>
              </label>

              <div className="mt-6 flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-3 font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.4)] transition hover:shadow-[0_0_32px_rgba(124,58,237,0.6)]"
                >
                  <FaSave /> Save Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDisplayName(user?.displayName || 'RYTA HUB User')}
                  className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-gray-300 transition hover:bg-white/10"
                >
                  Cancel
                </motion.button>
              </div>

              <AnimatePresence>
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 flex items-center gap-2 text-sm text-emerald-400"
                  >
                    <FaCheck /> Profile saved successfully
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Google Drive Card */}
            <motion.div
              variants={itemVariants}
              className="glass rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 p-3 text-emerald-300">
                  <FaGoogleDrive />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Google Drive</h2>
                  <p className="text-sm text-gray-400">Backup your conversations</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#1A1A22]/50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">RYTA HUB Chats</p>
                    <p className="mt-1 text-sm text-gray-400">
                      Status: <span className="text-emerald-400">Connected ✅</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Files saved: <span className="text-purple-300">{stats.chatsSaved}</span>
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      Last sync: {lastSyncTime.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open('https://drive.google.com', '_blank')}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 transition hover:bg-white/10"
                >
                  <FaLink /> Open Drive
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSyncDrive}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_16px_rgba(16,185,129,0.3)]"
                >
                  {syncing ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <FaSync />
                    </motion.span>
                  ) : (
                    <FaSync />
                  )}
                  Sync Now
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Preferences/Settings Card */}
          <motion.div
            variants={itemVariants}
            className="glass mt-8 rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full border border-purple-400/30 bg-purple-500/10 p-3 text-purple-300">
                <FaCog />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Preferences</h2>
                <p className="text-sm text-gray-400">Customize your experience</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {settingOptions.map((option, index) => (
                <motion.div
                  key={option.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  className="glass flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-xl transition"
                >
                  <span className="text-sm text-gray-200">{option.label}</span>
                  <motion.button
                    onClick={() => !option.locked && toggleSetting(option.key)}
                    disabled={option.locked}
                    className="cursor-pointer"
                  >
                    <ToggleSwitch
                      checked={settings[option.key]}
                      onChange={() => !option.locked && toggleSetting(option.key)}
                    />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            variants={itemVariants}
            className="mt-8 rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-950/20 to-red-900/10 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full border border-red-400/30 bg-red-500/10 p-3 text-red-300">
                <FaTrash />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Danger Zone</h2>
                <p className="text-sm text-red-300/70">Irreversible actions</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowClearModal(true)}
                className="flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/25"
              >
                <FaTimesCircle /> Clear Chat History
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDisconnectModal(true)}
                className="flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/25"
              >
                <FaGoogleDrive /> Disconnect Drive
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/25"
              >
                <FaTrash /> Delete Account
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl"
            >
              <h2 className="text-2xl font-bold text-white">Delete Account?</h2>
              <p className="mt-3 text-sm text-gray-400">
                This action cannot be undone. All saved chats and preferences will be permanently deleted.
              </p>
              <div className="mt-8 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowDeleteModal(false);
                    handleLogout();
                  }}
                  className="flex-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disconnect Drive Modal */}
      <AnimatePresence>
        {showDisconnectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onClick={() => setShowDisconnectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl"
            >
              <h2 className="text-2xl font-bold text-white">Disconnect Google Drive?</h2>
              <p className="mt-3 text-sm text-gray-400">
                Your future chat saves will stop until you reconnect your drive.
              </p>
              <div className="mt-8 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDisconnectModal(false)}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDisconnectModal(false)}
                  className="flex-1 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]"
                >
                  Disconnect
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Chat History Modal */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onClick={() => setShowClearModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-md rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl"
            >
              <h2 className="text-2xl font-bold text-white">Clear All Chat History?</h2>
              <p className="mt-3 text-sm text-gray-400">
                This will remove all your saved conversations. This action cannot be undone.
              </p>
              <div className="mt-8 flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    localStorage.removeItem('chatHistory');
                    setShowClearModal(false);
                  }}
                  className="flex-1 rounded-full bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                >
                  Clear
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
