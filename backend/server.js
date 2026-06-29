import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { generateModelReply, models } from './services/aiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'RYTA HUB backend is running' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages = [], preferredIndex = 0 } = req.body || {};
    const currentModel = models[preferredIndex % models.length];
    const lastUserMessage = [...messages].reverse().find((entry) => entry.role === 'user');
    const nextIndex = (preferredIndex + 1) % models.length;
    const providerReply = await generateModelReply(currentModel.slug, messages);

    res.json({
      reply: providerReply.reply,
      modelUsed: providerReply.modelUsed || currentModel.name,
      modelSlug: providerReply.modelSlug || currentModel.slug,
      switched: preferredIndex > 0,
      previousModel: currentModel.name,
      nextIndex,
      availableModels: models.length,
      provider: providerReply.provider,
      configured: providerReply.configured,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`RYTA HUB backend listening on port ${PORT}`);
});
