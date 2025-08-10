"use server";

import { generateImageFromTeluguText } from "@/ai/flows/generate-image-from-telugu-text";
import { inferStudentEmotion } from "@/ai/flows/infer-student-emotion";
import { provideAutocompleteSuggestions } from "@/ai/flows/provide-autocomplete-suggestions";
import { summarizeTextbookContent } from "@/ai/flows/summarize-textbook-content";

type AIResponse = {
  responseText?: string;
  imageUrl?: string;
  emotion?: string;
  error?: string;
};

export async function getAiResponse(
  prompt: string,
  grade: string,
  feature: string
): Promise<AIResponse> {
  if (!prompt) {
    return { error: "Prompt cannot be empty." };
  }

  try {
    let responseText: string | undefined;
    let imageUrl: string | undefined;

    // We can infer emotion regardless of the feature
    const emotionPromise = inferStudentEmotion({ studentInput: prompt });

    switch (feature) {
      case "ask":
      case "summarize":
        const summaryResponse = await summarizeTextbookContent({
          textbookContent: prompt,
        });
        responseText = summaryResponse.summary;
        break;
      case "image":
        const imageResponse = await generateImageFromTeluguText({
          teluguText: prompt,
        });
        imageUrl = imageResponse.imageDataUri;
        responseText = `Here is the image you requested for: "${prompt}"`;
        break;
      default:
        return { error: "Invalid feature selected." };
    }

    const emotionResult = await emotionPromise;

    return {
      responseText,
      imageUrl,
      emotion: emotionResult.emotion,
    };
  } catch (error) {
    console.error("AI action error:", error);
    return { error: "An error occurred while processing your request." };
  }
}

export async function getAutocompleteSuggestions(
  text: string,
  grade: number
): Promise<{ suggestions: string[] }> {
  try {
    const response = await provideAutocompleteSuggestions({
      inputText: text,
      gradeLevel: grade,
    });
    return response;
  } catch (error) {
    console.error("Autocomplete error:", error);
    return { suggestions: [] };
  }
}
