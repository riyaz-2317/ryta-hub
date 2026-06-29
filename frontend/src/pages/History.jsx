import { useMemo, useState } from 'react';
import { FaSearch, FaTrash } from 'react-icons/fa';

const sampleChats = [
  { id: '1', title: 'Study plan', preview: 'How should I split my week for exams?', aiBadges: ['GPT-4.1', 'Claude 3.7'], date: 'Today • 09:20' },
  { id: '2', title: 'Lecture summary', preview: 'Summarize the latest theory lecture into bullet points.', aiBadges: ['Gemini 2.5'], date: 'Yesterday • 18:40' },
];

export default function History() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All AIs');
  const filteredChats = useMemo(() => {
    return sampleChats.filter((chat) => {
      const matchesQuery = chat.preview.toLowerCase().includes(query.toLowerCase()) || chat.title.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === 'All AIs' || chat.aiBadges.includes(filter);
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

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
            <option>GPT-4.1</option>
            <option>Claude 3.7</option>
            <option>Gemini 2.5</option>
            <option>Llama 3.3</option>
          </select>
        </div>

        {filteredChats.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-[#13131A]/70 p-10 text-center text-gray-400">No chats yet. Start a conversation!</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredChats.map((chat) => (
              <div key={chat.id} className="group relative rounded-[28px] border border-white/10 bg-[#13131A]/80 p-5 shadow-xl transition hover:-translate-y-2 hover:border-purple-400/40 hover:shadow-purple-500/20">
                <button className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-red-300">
                  <FaTrash />
                </button>
                <p className="text-sm text-gray-400">{chat.date}</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{chat.title}</h3>
                <p className="mt-3 text-sm text-gray-400">{chat.preview}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {chat.aiBadges.map((badge) => (
                    <span key={badge} className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-200">{badge}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
