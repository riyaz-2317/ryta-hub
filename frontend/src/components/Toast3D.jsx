import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { FaArrowRight, FaBolt } from 'react-icons/fa';

export default function Toast3D({ visible, previousModel, newModel, onClose }) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed right-6 top-6 z-50 max-w-sm rounded-3xl border border-purple-400/30 bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] p-4 text-white shadow-2xl"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white/20 p-2">
              <FaBolt />
            </div>
            <div>
              <p className="font-semibold">{previousModel} limit reached</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-purple-100">
                <span>{previousModel}</span>
                <FaArrowRight />
                <span>{newModel}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
