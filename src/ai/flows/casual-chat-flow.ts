'use server';

/**
 * @fileOverview A casual chat flow.
 *
 * - casualChat - A function that handles the casual chat process.
 * - CasualChatInput - The input type for the casualChat function.
 * - CasualChatOutput - The return type for the casualChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CasualChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
  gradeLevel: z.string().describe('The grade level of the student.'),
});
export type CasualChatInput = z.infer<typeof CasualChatInputSchema>;

const CasualChatOutputSchema = z.object({
  response: z.string().describe('The AI response.'),
});
export type CasualChatOutput = z.infer<typeof CasualChatOutputSchema>;

export async function casualChat(
  input: CasualChatInput
): Promise<CasualChatOutput> {
  return casualChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'casualChatPrompt',
  input: {schema: CasualChatInputSchema},
  output: {schema: CasualChatOutputSchema},
  prompt: `You are Telugu Thodu, a friendly and helpful AI assistant for students in Telangana, India. Your goal is to have a casual, encouraging, and supportive conversation in simple Telugu. The student is in grade {{{gradeLevel}}}.

User: {{{message}}}
AI: `,
});

const casualChatFlow = ai.defineFlow(
  {
    name: 'casualChatFlow',
    inputSchema: CasualChatInputSchema,
    outputSchema: CasualChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
