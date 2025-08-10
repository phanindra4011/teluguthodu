'use server';

/**
 * @fileOverview Implements the autocomplete suggestions feature for the Vidyarthi Mitra app.
 *
 * - provideAutocompleteSuggestions - Provides autocomplete suggestions based on the input text.
 * - AutocompleteSuggestionsInput - The input type for the provideAutocompleteSuggestions function.
 * - AutocompleteSuggestionsOutput - The return type for the provideAutocompleteSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutocompleteSuggestionsInputSchema = z.object({
  inputText: z.string().describe('The input text for which to provide autocomplete suggestions.'),
  gradeLevel: z.number().optional().describe('The grade level of the student.'),
});
export type AutocompleteSuggestionsInput = z.infer<typeof AutocompleteSuggestionsInputSchema>;

const AutocompleteSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of autocomplete suggestions.'),
});
export type AutocompleteSuggestionsOutput = z.infer<typeof AutocompleteSuggestionsOutputSchema>;

export async function provideAutocompleteSuggestions(input: AutocompleteSuggestionsInput): Promise<AutocompleteSuggestionsOutput> {
  return provideAutocompleteSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autocompleteSuggestionsPrompt',
  input: {schema: AutocompleteSuggestionsInputSchema},
  output: {schema: AutocompleteSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to provide autocomplete suggestions for Telugu text.

  The user is typing the following text:
  """
  {{{inputText}}}
  """

  Generate a list of autocomplete suggestions that the user might be trying to type. Consider the student's grade level ({{{gradeLevel}}}), if provided, and tailor the suggestions accordingly. Use common Telugu words, phrases, and content from Telangana state textbooks for grades 1-10.

  Respond with an array of strings, where each string is an autocomplete suggestion.

  The suggestions should be relevant to the input text and the student's grade level.
  The suggestions should be in simple Telugu.
  The suggestions should not repeat the input text.
`,
});

const provideAutocompleteSuggestionsFlow = ai.defineFlow(
  {
    name: 'provideAutocompleteSuggestionsFlow',
    inputSchema: AutocompleteSuggestionsInputSchema,
    outputSchema: AutocompleteSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
