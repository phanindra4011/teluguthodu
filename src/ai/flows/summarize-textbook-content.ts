'use server';

/**
 * @fileOverview Summarizes Telugu textbook content for students.
 *
 * - summarizeTextbookContent - A function that summarizes textbook content.
 * - SummarizeTextbookContentInput - The input type for the summarizeTextbookContent function.
 * - SummarizeTextbookContentOutput - The return type for the summarizeTextbookContent function.
 */

import {ai} from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import {z} from 'genkit';

const SummarizeTextbookContentInputSchema = z.object({
  textbookContent: z.string().describe('The content from the Telugu textbook to summarize.'),
});
export type SummarizeTextbookContentInput = z.infer<typeof SummarizeTextbookContentInputSchema>;

const SummarizeTextbookContentOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of the textbook content, no more than 300 words.'),
  progress: z.string().describe('A short, one-sentence summary of the summarization progress.'),
});
export type SummarizeTextbookContentOutput = z.infer<typeof SummarizeTextbookContentOutputSchema>;

export async function summarizeTextbookContent(
  input: SummarizeTextbookContentInput
): Promise<SummarizeTextbookContentOutput> {
  return summarizeTextbookContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTextbookContentPrompt',
  model: gemini15Flash,
  input: {schema: SummarizeTextbookContentInputSchema},
  output: {schema: SummarizeTextbookContentOutputSchema},
  prompt: `You are Vidyarthi Mitra, an expert in Telugu language and literature, specializing in creating summaries for students.

  Summarize the following content from a Telugu textbook in a way that is easy for students to understand. The summary should be no more than 300 words and use simple, easily understandable Telugu appropriate for students in grades 1-10. Avoid complex words and sentence structures. Maintain a supportive and positive tone.

  IMPORTANT: You must respond ONLY in Telugu.

  Content to summarize: {{{textbookContent}}}

  Make sure the summary contains all the key points from the original content.
  Include a progress message that briefly describes the summarization process.
`,
});

const summarizeTextbookContentFlow = ai.defineFlow(
  {
    name: 'summarizeTextbookContentFlow',
    inputSchema: SummarizeTextbookContentInputSchema,
    outputSchema: SummarizeTextbookContentOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const {output} = await prompt(input);
        // Ensure that a progress message is included in the output.
        if (!output?.progress) {
          output!.progress = 'Summarization completed.';
        }

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
