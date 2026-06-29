import { FaExternalLinkAlt, FaShareAlt, FaRobot } from 'react-icons/fa';

export default function Navbar({ currentModel, onModelChange }) {
  return (
    <div className="glass flex items-center justify-between rounded-[28px] border border-white/10 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4C1D95]">
          <FaRobot />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">RYTA HUB</p>
          <p className="text-xs text-gray-400">Premium AI workspace</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-full border border-purple-400/30 bg-purple-500/20 px-4 py-2 text-sm text-white">{currentModel}</div>
        <select onChange={(e) => onModelChange(e.target.value)} className="rounded-full border border-white/10 bg-[#13131A] px-3 py-2 text-sm text-gray-200">
          <option value="GPT-4.1">GPT-4.1</option>
          <option value="Claude 3.7">Claude 3.7</option>
          <option value="Gemini 2.5">Gemini 2.5</option>
          <option value="Llama 3.3">Llama 3.3</option>
        </select>
        <button className="rounded-full border border-white/10 bg-white/5 p-3 text-sm text-gray-200">
          <FaExternalLinkAlt />
        </button>
        <button className="rounded-full border border-white/10 bg-white/5 p-3 text-sm text-gray-200">
          <FaShareAlt />
        </button>
      </div>
    </div>
  );
}
