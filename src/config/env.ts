import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
  },
} as const;

// Validate required environment variables
export function validateConfig(): void {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is required');
  }
}