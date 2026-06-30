import { memo, useMemo } from 'react';
import { FaPlus, FaSignOutAlt, FaRobot } from 'react-icons/fa';

const groupTitles = ['Today', 'Yesterday', 'Last 7 Days', 'Older'];

function Sidebar({ user, chats, activeChat, onNewChat, onSelectChat, onLogout, availableModels = [] }) {
  const groupedChats = useMemo(() => {
    const groups = Object.fromEntries(groupTitles.map((title) => [title, []]));
    chats.forEach((chat) => {
      const group = chat.group || 'Older';
      if (!groups[group]) groups[group] = [];
      groups[group].push(chat);
    });
    return groupTitles.filter((group) => groups[group]?.length).map((group) => ({ name: group, items: groups[group] }));
  }, [chats]);

  return (
    <aside className="glass flex h-screen w-[280px] flex-col border-r border-white/10 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-[0.2em] text-white">RYTA HUB</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-purple-300">v1.0</p>
        </div>
        <div className="rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1 text-[10px] text-purple-200">AI CORE</div>
      </div>

      <div className="mt-6 rounded-3xl border border-purple-400/20 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <img loading="lazy" src={user.photoURL} alt="avatar" className="h-12 w-12 rounded-full border-2 border-purple-400/40" />
          <div>
            <p className="text-sm font-semibold text-white">{user.displayName}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Online
        </div>
      </div>

      <button onClick={onNewChat} className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] px-4 py-3 text-sm font-semibold text-white shadow-lg">
        <FaPlus /> New Chat
      </button>

      <div className="mt-6 flex-1 overflow-auto">
        {groupedChats.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-gray-400">No saved chats yet.</div>
        ) : (
          groupedChats.map((group) => (
            <div key={group.name} className="mb-4">
              <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-gray-500">{group.name}</p>
              <div className="space-y-2">
                {group.items.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${activeChat?.id === chat.id ? 'border-purple-400/40 bg-purple-500/20' : 'border-white/10 bg-white/5 hover:-translate-y-1 hover:shadow-xl'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">{chat.preview || 'New conversation'}</p>
                        <p className="mt-1 text-xs text-gray-400">{chat.date ? new Date(chat.date).toLocaleString() : 'Just now'}</p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-[#13131A] px-2 py-1 text-[10px] text-purple-200">{chat.model || 'RYTA HUB'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <FaRobot /> Model Status
        </div>
        <div className="space-y-2 text-sm text-gray-300">
          {availableModels.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-400">No models available yet.</div>
          ) : availableModels.map((model) => (
            <div key={model.name} className="flex items-center justify-between">
              <span>{model.name}</span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
          ))}
        </div>
      </div>

      <button onClick={onLogout} className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
}

export default memo(Sidebar);
