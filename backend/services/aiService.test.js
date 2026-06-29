import assert from 'node:assert/strict';
import { generateModelReply } from './aiService.js';

(async () => {
  process.env.GOOGLE_API_KEY = '';
  process.env.GEMINI_API_KEY = '';
  process.env.GROQ_API_KEY = '';
  process.env.COHERE_API_KEY = '';
  process.env.OPENAI_API_KEY = '';
  process.env.ANTHROPIC_API_KEY = '';
  process.env.MISTRAL_API_KEY = '';
  process.env.PERPLEXITY_API_KEY = '';
  process.env.GROK_API_KEY = '';

  const response = await generateModelReply('gpt-4.1', [{ role: 'user', content: 'Hello' }]);
  assert.equal(response.configured, false);
  assert.match(response.reply, /no API key is configured/i);
  console.log('aiService skip-empty-keys test passed');
})();
