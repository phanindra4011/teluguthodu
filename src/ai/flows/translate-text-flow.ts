'use server';

/**
 * @fileOverview A text translation flow.
 *
 * - translateText - A function that handles the text translation process.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import {z} from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguage: z.enum(['Telugu', 'English']).describe('The language to translate the text into.'),
  sourceLanguage: z.enum(['Telugu', 'English']).describe('The language of the input text.'),
  gradeLevel: z.string().describe('The grade level of the student.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  model: gemini15Flash,
  input: {schema: TranslateTextInputSchema},
  output: {schema: TranslateTextOutputSchema},
  prompt: `You are Vidyarthi Mitra, a helpful AI assistant. Translate the following text from {{{sourceLanguage}}} to {{{targetLanguage}}} for a student in grade {{{gradeLevel}}}. Keep the translation simple, clear, and appropriate for their level. Avoid complex words and sentence structures. Maintain a supportive and positive tone.

IMPORTANT: If the target language is Telugu, you must respond ONLY in Telugu.

Text to translate: {{{text}}}

Translated text:`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error: any) {
        lastError = error;
        
        // If it's a service overload error, wait and retry
        if (error.message?.includes('503') || error.message?.includes('overloaded')) {
          if (attempt < maxRetries) {
            // Wait progressively longer between retries (1s, 2s, 4s)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
            continue;
          }
        }
        
        // For other errors or max retries reached, throw the error
        throw error;
      }
    }
    
    throw lastError;
  }
);
