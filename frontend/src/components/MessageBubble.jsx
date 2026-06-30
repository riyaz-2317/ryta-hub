import { memo } from 'react';
import { motion } from 'framer-motion';
import { FaCopy, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

function MessageBubble({ message, isUser, aiName, aiColor, timestamp }) {
  const copyText = async () => {
    await navigator.clipboard.writeText(message.content);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] rounded-3xl border px-4 py-3 ${isUser ? 'border-purple-400/30 bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] text-white' : 'border-white/10 bg-[#13131A] text-gray-200'}`}>
        {!isUser && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold" style={{ backgroundColor: aiColor, color: 'white' }}>
              {aiName.slice(0, 1)}
            </div>
            <span className="text-sm font-semibold text-white">{aiName}</span>
          </div>
        )}
        <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
        <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
          <span>{timestamp}</span>
          {!isUser && (
            <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
              <button onClick={copyText} className="rounded-full p-1 hover:text-white">
                <FaCopy />
              </button>
              <button className="rounded-full p-1 hover:text-white"><FaThumbsUp /></button>
              <button className="rounded-full p-1 hover:text-white"><FaThumbsDown /></button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(MessageBubble);
