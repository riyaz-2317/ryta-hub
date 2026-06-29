import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import Toast3D from '../components/Toast3D';
import ThreeBackground from '../components/ThreeBackground';
import { sendChat } from '../services/api';
import { createRytaHubFolder, initDrive, saveChatToDrive } from '../services/driveService';

const aiModels = [
  { name: 'GPT-4.1', color: '#8B5CF6' },
  { name: 'Claude 3.7', color: '#F59E0B' },
  { name: 'Gemini 2.5', color: '#10B981' },
  { name: 'Llama 3.3', color: '#38BDF8' },
  { name: 'Mistral Large', color: '#F472B6' },
  { name: 'Cohere Command R+', color: '#EC4899' },
  { name: 'Groq Llama', color: '#14B8A6' },
  { name: 'DeepSeek V3', color: '#A78BFA' },
  { name: 'Perplexity Sonar', color: '#FB923C' },
  { name: 'Grok 2', color: '#22C55E' },
];

function buildChatHistory(user) {
  return [
    { id: '1', group: 'Today', preview: 'What is the best study plan for my exams?', date: '09:20', model: 'GPT-4.1', messages: [{ role: 'user', content: 'What is the best study plan for my exams?' }, { role: 'assistant', content: 'I can help you build a focused study plan across all subjects.' }] },
    { id: '2', group: 'Yesterday', preview: 'Summarize this lecture into bullet points', date: '18:40', model: 'Claude 3.7', messages: [{ role: 'user', content: 'Summarize this lecture into bullet points' }, { role: 'assistant', content: 'Here is a clear structured summary.' }] },
  ];
}

export default function Chat({ user }) {
  const navigate = useNavigate();
  const [chats, setChats] = useState(() => buildChatHistory(user));
  const [activeChat, setActiveChat] = useState(chats[0]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [preferredIndex, setPreferredIndex] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastState, setToastState] = useState({ previousModel: '', newModel: '' });
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 144)}px`;
    }
  }, [input]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('googleAccessToken');
    navigate('/login');
  };

  const handleNewChat = () => {
    const newChat = {
      id: `${Date.now()}`,
      group: 'Today',
      preview: 'New conversation',
      date: 'Now',
      model: 'GPT-4.1',
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat);
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    const userMessage = { role: 'user', content: text };
    const nextMessages = [...(activeChat?.messages || []), userMessage];

    const tempChat = {
      ...activeChat,
      messages: nextMessages,
      preview: text,
      date: 'Now',
      model: aiModels[preferredIndex % aiModels.length].name,
    };

    setActiveChat(tempChat);
    setChats((prev) => prev.map((chat) => (chat.id === tempChat.id ? tempChat : chat)));
    setInput('');
    setTyping(true);

    const response = await sendChat(nextMessages, preferredIndex);
    const nextModelIndex = response.nextIndex ?? ((preferredIndex + 1) % aiModels.length);
    const assistantMessage = {
      role: 'assistant',
      content: response.reply,
      model: response.modelUsed,
      modelColor: aiModels[nextModelIndex % aiModels.length].color,
    };

    const updatedChat = {
      ...tempChat,
      messages: [...nextMessages, assistantMessage],
      preview: response.reply.slice(0, 40),
      date: 'Now',
      model: response.modelUsed,
    };

    setActiveChat(updatedChat);
    setChats((prev) => prev.map((chat) => (chat.id === updatedChat.id ? updatedChat : chat)));
    setPreferredIndex(nextModelIndex);
    setToastVisible(true);
    setToastState({ previousModel: aiModels[preferredIndex % aiModels.length].name, newModel: response.modelUsed });
    setTyping(false);

    if (user?.email) {
      await saveChatToDrive(updatedChat.id, updatedChat);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0F] text-white">
      <ThreeBackground chatting />
      <div className="relative z-10 flex min-h-screen">
        <Sidebar user={user} chats={chats} activeChat={activeChat} onNewChat={handleNewChat} onSelectChat={handleSelectChat} onLogout={handleLogout} />
        <main className="flex-1 p-4 sm:p-6">
          <Navbar currentModel={aiModels[preferredIndex % aiModels.length].name} onModelChange={(value) => setPreferredIndex(aiModels.findIndex((model) => model.name === value))} />
          <div className="mt-4 rounded-[32px] border border-white/10 bg-[#0A0A0F]/70 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex h-[calc(100vh-220px)] flex-col">
              <div className="flex-1 overflow-y-auto px-2 py-2">
                {(activeChat?.messages || []).map((message, index) => (
                  <MessageBubble key={`${message.role}-${index}`} message={message} isUser={message.role === 'user'} aiName={message.model || 'RYTA HUB'} aiColor={message.modelColor || '#7C3AED'} timestamp="just now" />
                ))}
                {typing && <TypingIndicator color="#7C3AED" label="RYTA HUB" />}
              </div>
              <div className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-4">
                <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} rows={1} placeholder="Ask RYTA HUB anything..." className="w-full resize-none bg-transparent text-sm text-white outline-none" />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {aiModels.map((model) => (
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
