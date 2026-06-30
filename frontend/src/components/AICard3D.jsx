import { memo } from 'react';
import { motion } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';

function AICard3D({ ai }) {
  return (
    <motion.div
      whileHover={{ rotateY: 180, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="h-44 w-full rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl"
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
    >
      <div className="flex h-full w-full flex-col justify-between [backface-visibility:hidden]" style={{ transform: 'rotateY(0deg)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: ai.color }}>
              <FaRobot size={18} color={ai.color} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{ai.name}</h3>
              <p className="text-xs text-gray-400">{ai.tag}</p>
            </div>
          </div>
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ai.status === 'available' ? '#10B981' : '#F59E0B' }} />
        </div>
        <p className="text-sm text-gray-300">{ai.short}</p>
      </div>
      <div className="absolute inset-0 flex h-full w-full flex-col justify-between rounded-3xl border border-white/10 bg-[#13131A]/90 p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-purple-300">Model</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{ai.model}</h3>
        </div>
        <p className="text-sm text-gray-300">{ai.description}</p>
      </div>
    </motion.div>
  );
}

export default memo(AICard3D);
