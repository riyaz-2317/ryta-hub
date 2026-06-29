import { motion } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';

export default function TypingIndicator({ color, label }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#13131A]" style={{ color }}>
        <FaRobot size={16} />
      </div>
      <div className="rounded-2xl border border-white/10 bg-[#13131A] px-4 py-3 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-gray-400">{label}</span>
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}
