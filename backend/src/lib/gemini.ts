import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

export function getGeminiModel(modelName = 'gemini-2.5-flash') {
  if (!apiKey) {
    console.warn('GEMINI_API_KEY environment variable is not set.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}
