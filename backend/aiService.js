const models = [
  { slug: 'gpt-4.1', name: 'GPT-4.1', color: '#8B5CF6' },
  { slug: 'claude-3.7', name: 'Claude 3.7', color: '#F59E0B' },
  { slug: 'gemini-2.5', name: 'Gemini 2.5', color: '#10B981' },
  { slug: 'llama-3.3', name: 'Llama 3.3', color: '#38BDF8' },
  { slug: 'mistral-large', name: 'Mistral Large', color: '#F472B6' },
  { slug: 'cohere-command-r', name: 'Cohere Command R+', color: '#EC4899' },
  { slug: 'groq-llama', name: 'Groq Llama', color: '#14B8A6' },
  { slug: 'deepseek-v3', name: 'DeepSeek V3', color: '#A78BFA' },
  { slug: 'perplexity-sonar', name: 'Perplexity Sonar', color: '#FB923C' },
  { slug: 'grok-2', name: 'Grok 2', color: '#22C55E' },
];

function buildConversationMessages(messages = []) {
  const validMessages = messages.filter((entry) => entry?.role && entry?.content);
  return validMessages.map((entry) => ({
    role: entry.role === 'assistant' ? 'assistant' : 'user',
    content: String(entry.content).trim(),
  }));
}

function getProviderConfig(modelSlug) {
  switch (modelSlug) {
    case 'gpt-4.1':
      return {
        keyEnv: 'OPENAI_API_KEY',
        provider: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4.1',
        headers: (key) => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        }),
        buildPayload: (conversation) => ({
          model: 'gpt-4.1',
          messages: [{ role: 'system', content: 'You are RYTA HUB, a premium AI tutor and study companion.' }, ...conversation],
          temperature: 0.7,
        }),
        parseResponse: (data) => data?.choices?.[0]?.message?.content || '',
      };
    case 'claude-3.7':
      return {
        keyEnv: 'ANTHROPIC_API_KEY',
        provider: 'Anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-7-sonnet-20250219',
        headers: (key) => ({
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        }),
        buildPayload: (conversation) => ({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 700,
          system: 'You are RYTA HUB, a premium AI tutor and study companion.',
          messages: conversation.map((message) => ({ role: message.role, content: message.content })),
        }),
        parseResponse: (data) => data?.content?.[0]?.text || '',
      };
    case 'gemini-2.5':
      return {
        keyEnv: 'GOOGLE_API_KEY',
        provider: 'Google Gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        model: 'gemini-2.0-flash',
        headers: (key) => ({
          'Content-Type': 'application/json',
        }),
        buildPayload: (conversation) => ({
          system_instruction: { parts: [{ text: 'You are RYTA HUB, a premium AI tutor and study companion.' }] },
          contents: conversation.length
            ? conversation.map((message) => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.content }] }))
            : [{ role: 'user', parts: [{ text: 'Hello' }] }],
        }),
        parseResponse: (data) => data?.candidates?.[0]?.content?.parts?.[0]?.text || '',
      };
    case 'llama-3.3':
    case 'groq-llama':
      return {
        keyEnv: 'GROQ_API_KEY',
        provider: 'Groq',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile',
        headers: (key) => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        }),
        buildPayload: (conversation) => ({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: 'You are RYTA HUB, a premium AI tutor and study companion.' }, ...conversation],
          temperature: 0.7,
        }),
        parseResponse: (data) => data?.choices?.[0]?.message?.content || '',
      };
    case 'mistral-large':
      return {
        keyEnv: 'MISTRAL_API_KEY',
        provider: 'Mistral',
        endpoint: 'https://api.mistral.ai/v1/chat/completions',
        model: 'mistral-large-latest',
        headers: (key) => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        }),
        buildPayload: (conversation) => ({
          model: 'mistral-large-latest',
          messages: [{ role: 'system', content: 'You are RYTA HUB, a premium AI tutor and study companion.' }, ...conversation],
          temperature: 0.7,
        }),
        parseResponse: (data) => data?.choices?.[0]?.message?.content || '',
      };
    case 'cohere-command-r':
      return {
        keyEnv: 'COHERE_API_KEY',
        provider: 'Cohere',
        endpoint: 'https://api.cohere.com/v2/chat',
        model: 'command-r-plus',
        headers: (key) => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        }),
        buildPayload: (conversation) => ({
          model: 'command-r-plus',
          message: conversation.filter((entry) => entry.role === 'user').slice(-1)[0]?.content || 'Hello',
          chat_history: conversation.filter((entry) => entry.role !== 'system').slice(0, -1).map((entry) => ({ role: entry.role, message: entry.content })),
          preamble: 'You are RYTA HUB, a premium AI tutor and study companion.',
        }),
        parseResponse: (data) => data?.text || data?.message?.content?.[0]?.text || '',
      };
    case 'deepseek-v3':
      return {
        keyEnv: 'DEEPSEEK_API_KEY',
        provider: 'DeepSeek',
        endpoint: 'https://api.deepseek.com/chat/completions',
        model: 'deepseek-chat',
        headers: (key) => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        }),
        buildPayload: (conversation) => ({
          model: 'deepseek-chat',
          messages: [{ role: 'system', content: 'You are RYTA HUB, a premium AI tutor and study companion.' }, ...conversation],
          temperature: 0.7,
        }),
        parseResponse: (data) => data?.choices?.[0]?.message?.content || '',
      };
    case 'perplexity-sonar':
      return {
        keyEnv: 'PERPLEXITY_API_KEY',
        provider: 'Perplexity',
        endpoint: 'https://api.perplexity.ai/chat/completions',
        model: 'sonar-pro',
        headers: (key) => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        }),
        buildPayload: (conversation) => ({
          model: 'sonar-pro',
          messages: [{ role: 'system', content: 'You are RYTA HUB, a premium AI tutor and study companion.' }, ...conversation],
          temperature: 0.7,
        }),
        parseResponse: (data) => data?.choices?.[0]?.message?.content || '',
      };
    case 'grok-2':
      return {
        keyEnv: 'GROK_API_KEY',
        provider: 'xAI Grok',
        endpoint: 'https://api.x.ai/v1/chat/completions',
        model: 'grok-2',
        headers: (key) => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        }),
        buildPayload: (conversation) => ({
          model: 'grok-2',
          messages: [{ role: 'system', content: 'You are RYTA HUB, a premium AI tutor and study companion.' }, ...conversation],
          temperature: 0.7,
        }),
        parseResponse: (data) => data?.choices?.[0]?.message?.content || '',
      };
    default:
      return null;
  }
}

export async function generateModelReply(modelSlug, messages = []) {
  const model = models.find((entry) => entry.slug === modelSlug) || models[0];
  const config = getProviderConfig(model.slug);
  const conversation = buildConversationMessages(messages);

  if (!config) {
    throw new Error(`Unsupported model: ${model.slug}`);
  }

  const apiKey = process.env[config.keyEnv];
  if (!apiKey) {
    return {
      reply: `Live ${model.name} responses are ready, but ${config.keyEnv} is not configured yet. Add it to backend/.env to enable real provider calls.`,
      modelUsed: model.name,
      modelSlug: model.slug,
      provider: config.provider,
      configured: false,
    };
  }

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: config.headers(apiKey),
      body: JSON.stringify(config.buildPayload(conversation)),
    });

    const rawBody = await response.text();
    let parsedBody = {};
    try {
      parsedBody = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      parsedBody = {};
    }

    if (!response.ok) {
      throw new Error(parsedBody?.error?.message || parsedBody?.message || `Provider request failed with ${response.status}`);
    }

    const reply = config.parseResponse(parsedBody);
    if (!reply) {
      throw new Error('The provider returned an empty response.');
    }

    return {
      reply,
      modelUsed: model.name,
      modelSlug: model.slug,
      provider: config.provider,
      configured: true,
    };
  } catch (error) {
    return {
      reply: `RYTA HUB could not reach ${config.provider} right now. ${error.message}`,
      modelUsed: model.name,
      modelSlug: model.slug,
      provider: config.provider,
      configured: true,
      error: error.message,
    };
  }
}

export { models };
