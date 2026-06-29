import { motion } from 'framer-motion';
import { FaGoogle, FaBrain, FaCloud, FaUser, FaInfinity, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ThreeBackground from '../components/ThreeBackground';
import AICard3D from '../components/AICard3D';

const aiModels = [
  { name: 'GPT-4.1', tag: 'OpenAI', model: 'gpt-4.1', color: '#8B5CF6', status: 'available', short: 'Reasoning, writing, coding', description: 'Fast and polished for deep reasoning.' },
  { name: 'Claude 3.7', tag: 'Anthropic', model: 'claude-3.7', color: '#F59E0B', status: 'available', short: 'Long context ideas', description: 'Excellent for thoughtful, nuanced answers.' },
  { name: 'Gemini 2.5', tag: 'Google', model: 'gemini-2.5', color: '#10B981', status: 'available', short: 'Multimodal creativity', description: 'Balanced for image and text tasks.' },
  { name: 'Llama 3.3', tag: 'Meta', model: 'llama-3.3', color: '#38BDF8', status: 'available', short: 'Open-source flexibility', description: 'Versatile for coding and general assistance.' },
  { name: 'Mistral Large', tag: 'Mistral', model: 'mistral-large', color: '#F472B6', status: 'limited', short: 'Efficient multilingual', description: 'Great for multilingual and compact tasks.' },
  { name: 'Cohere', tag: 'Cohere', model: 'cohere-command-r', color: '#EC4899', status: 'available', short: 'Enterprise tone', description: 'Ideal for structured business outputs.' },
  { name: 'Groq', tag: 'Groq', model: 'groq-llama', color: '#14B8A6', status: 'available', short: 'Ultra-speed inference', description: 'Lightning fast responses for rapid workflows.' },
  { name: 'DeepSeek', tag: 'DeepSeek', model: 'deepseek-v3', color: '#A78BFA', status: 'checking', short: 'Low latency', description: 'A reliable addition for fast experimentation.' },
  { name: 'Perplexity', tag: 'Perplexity', model: 'perplexity-sonar', color: '#FB923C', status: 'available', short: 'Research workflows', description: 'Excellent for web-grounded research.' },
  { name: 'Grok 2', tag: 'xAI', model: 'grok-2', color: '#22C55E', status: 'available', short: 'Realtime insight', description: 'A strong conversational model for active tasks.' },
];

const features = [
  { title: 'Auto Switch', icon: <FaArrowRight />, description: 'The platform routes your questions through every AI seamlessly.' },
  { title: 'Google Drive Sync', icon: <FaCloud />, description: 'Every chat is saved to your Drive automatically.' },
  { title: 'Real Profile', icon: <FaUser />, description: 'Google login unlocks real profile photos and Gmail identity.' },
  { title: 'Zero Limits', icon: <FaInfinity />, description: 'You always get another model when one reaches a cap.' },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0F] text-white">
      <ThreeBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="text-2xl font-black tracking-[0.25em] text-white">RYTA HUB</div>
          <Link to="/login" className="rounded-full border border-purple-400/30 bg-white/5 px-5 py-2 text-sm text-purple-200">Start Free</Link>
        </header>

        <main className="flex flex-1 flex-col justify-center">
          <section className="grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-black leading-tight sm:text-7xl lg:text-[84px]">
                <span className="neon-text">RYTA HUB</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 text-2xl font-semibold text-purple-300">
                10 AIs. Zero Limits. One Platform.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 rounded-3xl border border-purple-400/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
                <p className="text-lg text-gray-200">10,000+ students never hit a limit</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex flex-wrap items-center gap-4">
                <Link to="/login" className="flex items-center gap-3 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#4C1D95] px-6 py-4 font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.4)]">
                  <FaGoogle /> Start Chatting Free
                </Link>
                <div className="text-sm text-gray-400">Secure Google login • Drive sync • premium UI</div>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="glass rounded-[36px] border border-white/10 p-6 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                {aiModels.slice(0, 6).map((ai) => (
                  <div key={ai.name} className="rounded-2xl border border-white/10 bg-[#13131A]/80 p-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ai.color }} />
                      <p className="font-semibold text-white">{ai.name}</p>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">{ai.short}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          <section className="py-8">
            <h2 className="text-3xl font-bold text-white">10 AIs. All In One Place.</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
              {aiModels.map((ai) => (
                <AICard3D key={ai.name} ai={ai} />
              ))}
            </div>
          </section>

          <section className="grid gap-6 py-8 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="glass rounded-[28px] border border-white/10 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] text-xl text-white">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </section>
        </main>

        <footer className="border-t border-white/10 py-6 text-center text-sm text-gray-500">
          RYTA HUB © 2025 — Built for students who never stop learning
        </footer>
      </div>
    </div>
  );
}
