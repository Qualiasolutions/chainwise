import OpenAI from 'openai';

// Initialize OpenAI client with graceful fallback
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder-key-for-development',
});

export default openai;