import { useEffect, useMemo, useState } from 'react';
import { FaSearch, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'ryta_chats';

function loadStoredChats() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export default function History() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All AIs');
  const [aiOptions, setAiOptions] = useState([]);

  useEffect(() => {
    const storedChats = loadStoredChats();
    setChats(storedChats);
    const models = Array.from(new Set(storedChats.flatMap((chat) => chat.modelsUsed || []))); 
    setAiOptions(models);
  }, []);

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const preview = (chat.preview || chat.messages?.[0]?.content || '').toLowerCase();
      const title = (chat.title || chat.preview || '').toLowerCase();
      const matchesQuery = preview.includes(query.toLowerCase()) || title.includes(query.toLowerCase());
      const modelsUsed = chat.modelsUsed || [chat.model];
      const matchesFilter = filter === 'All AIs' || modelsUsed.includes(filter);
      return matchesQuery && matchesFilter;
    });
  }, [chats, filter, query]);

  const handleDelete = (chatId) => {
    const nextChats = chats.filter((chat) => chat.id !== chatId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextChats));
    setChats(nextChats);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white">Chat History</h1>
          <p className="mt-2 text-gray-400">Search, filter, and restore every conversation.</p>
        </div>
        <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[#13131A]/80 p-4 shadow-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0A0A0F] px-4 py-3">
            <FaSearch className="text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chats" className="w-full bg-transparent text-sm text-white outline-none" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-2xl border border-white/10 bg-[#0A0A0F] px-4 py-3 text-sm text-white outline-none">
            <option>All AIs</option>
            {aiOptions.map((ai) => (
              <option key={ai} value={ai}>{ai}</option>
            ))}
          </select>
        </div>

        {filteredChats.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-[#13131A]/70 p-10 text-center text-gray-400">No chats yet. Start a conversation!</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredChats.map((chat) => (
              <div key={chat.id} className="group relative rounded-[28px] border border-white/10 bg-[#13131A]/80 p-5 shadow-xl transition hover:-translate-y-2 hover:border-purple-400/40 hover:shadow-purple-500/20">
                <button onClick={() => handleDelete(chat.id)} className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-red-300">
                  <FaTrash />
                </button>
                <p className="text-sm text-gray-400">{chat.date ? new Date(chat.date).toLocaleString() : 'Recent'}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{chat.title || chat.preview || 'Untitled Chat'}</h3>
                <p className="mt-3 text-sm text-gray-400">{chat.preview || chat.messages?.[0]?.content || 'No preview available.'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(chat.modelsUsed || [chat.model]).map((badge) => (
                    <span key={badge} className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-200">{badge}</span>
                  ))}
                </div>
                <button onClick={() => navigate('/chat')} className="mt-4 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">Open chat</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
