import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
} as const;

// Validate required environment variables
export function validateConfig() {
  if (!config.openai.apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
}