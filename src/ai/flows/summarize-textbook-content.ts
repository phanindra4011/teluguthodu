'use server';

/**
 * @fileOverview Summarizes Telugu textbook content for students.
 *
 * - summarizeTextbookContent - A function that summarizes textbook content.
 * - SummarizeTextbookContentInput - The input type for the summarizeTextbookContent function.
 * - SummarizeTextbookContentOutput - The return type for the summarizeTextbookContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTextbookContentInputSchema = z.object({
  textbookContent: z.string().describe('The content from the Telugu textbook to summarize.'),
});
export type SummarizeTextbookContentInput = z.infer<typeof SummarizeTextbookContentInputSchema>;

const SummarizeTextbookContentOutputSchema = z.object({
  summary: z
    .string()
    .describe('A summary of the textbook content, no more than 3000 words.'),
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
  input: {schema: SummarizeTextbookContentInputSchema},
  output: {schema: SummarizeTextbookContentOutputSchema},
  prompt: `You are an expert in Telugu language and literature, specializing in creating summaries for students.

  Summarize the following content from a Telugu textbook in a way that is easy for students to understand. The summary should be no more than 3000 words and use simple Telugu.

  IMPORTANT: You must respond ONLY in Telugu.

  Content to summarize: {{{textbookContent}}}

  Make sure the summary contains all the key points from the original content.
  Include a progress message that briefly describes the summarization process.
  The student is in grades 1-10, use language appropriate for those students.
`,
});

const summarizeTextbookContentFlow = ai.defineFlow(
  {
    name: 'summarizeTextbookContentFlow',
    inputSchema: SummarizeTextbookContentInputSchema,
    outputSchema: SummarizeTextbookContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure that a progress message is included in the output.
    if (!output?.progress) {
      output!.progress = 'Summarization completed.';
    }

    return output!;
  }
);
