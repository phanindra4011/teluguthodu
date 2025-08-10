'use server';

/**
 * @fileOverview This flow infers the student's emotional state from their input.
 *
 * - inferStudentEmotion - A function that infers the student's emotion from their input.
 * - InferStudentEmotionInput - The input type for the inferStudentEmotion function.
 * - InferStudentEmotionOutput - The return type for the inferStudentEmotion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InferStudentEmotionInputSchema = z.object({
  studentInput: z.string().describe('The input from the student.'),
});
export type InferStudentEmotionInput = z.infer<typeof InferStudentEmotionInputSchema>;

const InferStudentEmotionOutputSchema = z.object({
  emotion: z
    .string()
    .describe(
      'The inferred emotion of the student (e.g., confused, frustrated, curious).'
    ),
});
export type InferStudentEmotionOutput = z.infer<typeof InferStudentEmotionOutputSchema>;

export async function inferStudentEmotion(input: InferStudentEmotionInput): Promise<InferStudentEmotionOutput> {
  return inferStudentEmotionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inferStudentEmotionPrompt',
  input: {schema: InferStudentEmotionInputSchema},
  output: {schema: InferStudentEmotionOutputSchema},
  prompt: `You are an AI assistant designed to understand the emotions of students based on their text input.

  Analyze the following student input and determine their emotional state.  The emotion should be a single word.

  Student Input: {{{studentInput}}}

  Emotion: `,
});

const inferStudentEmotionFlow = ai.defineFlow(
  {
    name: 'inferStudentEmotionFlow',
    inputSchema: InferStudentEmotionInputSchema,
    outputSchema: InferStudentEmotionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
