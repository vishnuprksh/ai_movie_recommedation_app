import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  defaultModel: 'gemini' as 'groq' | 'gemini'
} as const;

// Validate required environment variables
export function validateConfig(): void {
  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
    throw new Error('Either GROQ_API_KEY or GEMINI_API_KEY environment variable is required');
  }
}