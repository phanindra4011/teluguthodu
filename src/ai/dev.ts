import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-textbook-content.ts';
import '@/ai/flows/provide-autocomplete-suggestions.ts';
import '@/ai/flows/generate-image-from-telugu-text.ts';
import '@/ai/flows/infer-student-emotion.ts';
import '@/ai/flows/casual-chat-flow.ts';
import '@/ai/flows/answer-question-flow.ts';
import '@/ai/flows/translate-text-flow.ts';
