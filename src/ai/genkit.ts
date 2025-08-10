import {genkit} from 'genkit';
import {googleAI, gemini15Flash} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config();

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.GEMINI_API_KEY})],
  models: [gemini15Flash],
});
