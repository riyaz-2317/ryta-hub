import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import Toast3D from '../components/Toast3D';
const ThreeBackground = lazy(() => import('../components/ThreeBackground'));
import { fetchConfiguredModels, sendChat } from '../services/api';
import { createRytaHubFolder, initDrive, saveChatToDrive } from '../services/driveService';

const STORAGE_KEY = 'ryta_chats';
const INITIAL_MODELS = [
  { name: 'GPT-4.1', slug: 'gpt-4.1', color: '#8B5CF6' },
  { name: 'Claude 3.7', slug: 'claude-3.7', color: '#F59E0B' },
  { name: 'Gemini 2.5', slug: 'gemini-2.5', color: '#10B981' },
  { name: 'Llama 3.3', slug: 'groq-llama', color: '#38BDF8' },
  { name: 'Mistral Large', slug: 'mistral-large', color: '#F472B6' },
  { name: 'Cohere Command R+', slug: 'cohere-command-r', color: '#EC4899' },
  { name: 'DeepSeek V3', slug: 'deepseek-v3', color: '#A78BFA' },
  { name: 'Perplexity Sonar', slug: 'perplexity-sonar', color: '#FB923C' },
  { name: 'Grok 2', slug: 'grok-2', color: '#22C55E' },
];

function buildChatHistory(user) {
  return [
    { id: '1', group: 'Today', preview: 'What is the best study plan for my exams?', date: '09:20', model: 'GPT-4.1', messages: [{ role: 'user', content: 'What is the best study plan for my exams?' }, { role: 'assistant', content: 'I can help you build a focused study plan across all subjects.' }] },
    { id: '2', group: 'Yesterday', preview: 'Summarize this lecture into bullet points', date: '18:40', model: 'Claude 3.7', messages: [{ role: 'user', content: 'Summarize this lecture into bullet points' }, { role: 'assistant', content: 'Here is a clear structured summary.' }] },
  ];
}

function saveSessions(chatsToStore) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chatsToStore));
}

function loadSessions() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function groupChatTitle(dateValue) {
  if (!dateValue) return 'Today';
  const now = new Date();
  const target = new Date(dateValue);
  const diffDays = Math.floor((now - target) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'Last 7 Days';
  return 'Older';
}

export default function Chat({ user }) {
  const navigate = useNavigate();
  const [chats, setChats] = useState(() => {
    const stored = loadSessions();
    return stored.length ? stored : buildChatHistory(user);
  });
  const [activeChat, setActiveChat] = useState(() => {
    const stored = loadSessions();
    return stored[0] || buildChatHistory(user)[0];
  });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [preferredIndex, setPreferredIndex] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastState, setToastState] = useState({ previousModel: '', newModel: '' });
  const [availableModels, setAvailableModels] = useState(INITIAL_MODELS);
  const [isHydratingModels, setIsHydratingModels] = useState(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    const initializeDrive = async () => {
      const token = localStorage.getItem('googleAccessToken') || '';
      initDrive(token);
      if (token) {
        await createRytaHubFolder();
      }
    };
    initializeDrive();
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const configured = await fetchConfiguredModels();
        if (configured.length) {
          setAvailableModels(configured.map((model) => ({ name: model.name, slug: model.slug, color: model.color || '#7C3AED' })));
          setPreferredIndex(0);
        }
      } finally {
        setIsHydratingModels(false);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 144)}px`;
    }
  }, [input]);

  useEffect(() => {
    saveSessions(chats);
  }, [chats]);

  const handleLogout = useCallback(async () => {
    await signOut(auth);
    localStorage.removeItem('googleAccessToken');
    navigate('/login');
  }, [navigate]);

  const handleNewChat = useCallback(() => {
    const newChat = {
      id: `${Date.now()}`,
      group: 'Today',
      preview: 'New conversation',
      date: new Date().toISOString(),
      model: availableModels[preferredIndex % availableModels.length]?.name || 'RYTA HUB',
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat);
  }, [availableModels, preferredIndex]);

  const handleSelectChat = useCallback((chat) => {
    setActiveChat(chat);
  }, []);

  const handleModelChange = useCallback((value) => {
    const index = availableModels.findIndex((model) => model.name === value);
    setPreferredIndex(index >= 0 ? index : 0);
  }, [availableModels]);

  const handleInputChange = useCallback((event) => {
    const value = event.target.value;
    window.clearTimeout(handleInputChange.timeout);
    handleInputChange.timeout = window.setTimeout(() => setInput(value), 120);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    const userMessage = { role: 'user', content: text };
    const nextMessages = [...(activeChat?.messages || []), userMessage];
    const currentModel = availableModels[preferredIndex % availableModels.length] || availableModels[0];

    const tempChat = {
      ...activeChat,
      id: activeChat?.id || `${Date.now()}`,
      messages: nextMessages,
      preview: text,
      date: new Date().toISOString(),
      model: currentModel?.name || 'RYTA HUB',
      group: groupChatTitle(new Date().toISOString()),
    };

    setActiveChat(tempChat);
    setChats((prev) => {
      const filtered = prev.filter((chat) => chat.id !== tempChat.id);
      return [tempChat, ...filtered];
    });
    setInput('');
    setTyping(true);

    const response = await sendChat(nextMessages, preferredIndex);
    const nextModelIndex = response.nextIndex ?? ((preferredIndex + 1) % availableModels.length);
    const assistantMessage = {
      role: 'assistant',
      content: response.reply,
      model: response.modelUsed,
      modelColor: availableModels[nextModelIndex % availableModels.length]?.color || '#7C3AED',
    };

    const updatedChat = {
      ...tempChat,
      messages: [...nextMessages, assistantMessage],
      preview: response.reply.slice(0, 40),
      date: new Date().toISOString(),
      model: response.modelUsed,
      group: groupChatTitle(new Date().toISOString()),
      modelsUsed: [...new Set([...(tempChat.modelsUsed || []), response.modelUsed])],
      updatedAt: new Date().toISOString(),
    };

    setActiveChat(updatedChat);
    setChats((prev) => {
      const filtered = prev.filter((chat) => chat.id !== updatedChat.id);
      return [updatedChat, ...filtered];
    });
    setPreferredIndex(nextModelIndex);
    setToastVisible(true);
    setToastState({ previousModel: currentModel?.name || 'RYTA HUB', newModel: response.modelUsed });
    setTyping(false);

    if (user?.email) {
      await saveChatToDrive(updatedChat.id, updatedChat);
    }
  }, [activeChat, availableModels, input, preferredIndex, user?.email]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0F] text-white">
      <Suspense fallback={null}>
        <ThreeBackground chatting />
      </Suspense>
      <div className="relative z-10 flex min-h-screen">
        <Sidebar user={user} chats={chats} activeChat={activeChat} onNewChat={handleNewChat} onSelectChat={handleSelectChat} onLogout={handleLogout} availableModels={availableModels} />
        <main className="flex-1 p-4 sm:p-6">
          <Navbar currentModel={availableModels[preferredIndex % availableModels.length]?.name || 'RYTA HUB'} onModelChange={handleModelChange} availableModels={availableModels} />
          <div className="mt-4 rounded-[32px] border border-white/10 bg-[#0A0A0F]/70 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex h-[calc(100vh-220px)] flex-col">
              <div className="flex-1 overflow-y-auto px-2 py-2">
                {(activeChat?.messages || []).map((message, index) => (
                  <MessageBubble key={`${message.role}-${index}`} message={message} isUser={message.role === 'user'} aiName={message.model || 'RYTA HUB'} aiColor={message.modelColor || '#7C3AED'} timestamp="just now" />
                ))}
                {typing && <TypingIndicator color="#7C3AED" label="RYTA HUB" />}
              </div>
              <div className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-4">
                <textarea ref={textareaRef} value={input} onChange={handleInputChange} rows={1} placeholder="Ask RYTA HUB anything..." className="w-full resize-none bg-transparent text-sm text-white outline-none" />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {availableModels.map((model) => (
                      <div key={model.name} className="rounded-full border border-white/10 bg-[#13131A] px-3 py-1 text-xs text-gray-300">{model.name}</div>
                    ))}
                  </div>
                  <button onClick={handleSend} className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] px-5 py-2 text-sm font-semibold text-white shadow-lg">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Toast3D visible={toastVisible} previousModel={toastState.previousModel} newModel={toastState.newModel} onClose={() => setToastVisible(false)} />
    </div>
  );
}
