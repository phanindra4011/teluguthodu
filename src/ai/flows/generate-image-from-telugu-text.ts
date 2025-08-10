'use server';

/**
 * @fileOverview Generates an image from Telugu text using the Gemini 2.0 Flash image generation model.
 *
 * - generateImageFromTeluguText - A function that takes Telugu text as input and returns a data URI of the generated image.
 * - GenerateImageInput - The input type for the generateImageFromTeluguText function.
 * - GenerateImageOutput - The return type for the generateImageFromTeluguText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { translateText } from './translate-text-flow';

const GenerateImageInputSchema = z.object({
  teluguText: z
    .string()
    .describe('The Telugu text to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImageFromTeluguText(
  input: GenerateImageInput
): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    // Translate the Telugu text to English first
    const { translatedText: englishPrompt } = await translateText({
      text: input.teluguText,
      sourceLanguage: 'Telugu',
      targetLanguage: 'English',
      gradeLevel: '10', // Grade level doesn't matter much for image prompt translation
    });

    // Enhance the prompt for a better style
    const styledPrompt = `A vibrant, cartoonish, and friendly illustration suitable for children's educational material, depicting: ${englishPrompt}`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: styledPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('No image was generated.');
    }

    return { imageDataUri: media.url };
  }
);
