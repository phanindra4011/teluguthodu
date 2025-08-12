import {genkit} from 'genkit';
import {googleAI, gemini15Flash, gemini15Pro} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config();

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  models: [gemini15Flash, gemini15Pro], // Add fallback model
});
