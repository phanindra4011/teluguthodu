'use server';

import { generateImageFromTeluguText } from "@/ai/flows/generate-image-from-telugu-text";
import { inferStudentEmotion } from "@/ai/flows/infer-student-emotion";
import { provideAutocompleteSuggestions } from "@/ai/flows/provide-autocomplete-suggestions";
import { summarizeTextbookContent } from "@/ai/flows/summarize-textbook-content";
import { casualChat } from "@/ai/flows/casual-chat-flow";
import { answerQuestion } from "@/ai/flows/answer-question-flow";
import { translateText } from "@/ai/flows/translate-text-flow";

type AIResponse = {
  responseText?: string;
  imageUrl?: string;
  emotion?: string;
  error?: string;
};

type AIOptions = {
  sourceLang?: string;
  targetLang?: string;
}

export async function getAiResponse(
  prompt: string,
  grade: string,
  feature: string,
  options: AIOptions = {}
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
      case "chat":
        const chatResponse = await casualChat({
            message: prompt,
            gradeLevel: grade,
        });
        responseText = chatResponse.response;
        break;
      case "ask":
        const askResponse = await answerQuestion({
          question: prompt,
          gradeLevel: grade,
        });
        responseText = askResponse.answer;
        break;
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
        responseText = `మీరు అభ్యర్థించిన చిత్రం ఇక్కడ ఉంది: "${prompt}"`;
        break;
      case "translate":
        if (!options.sourceLang || !options.targetLang) {
          return { error: "Source and target languages are required for translation." };
        }
        const translateResponse = await translateText({
          text: prompt,
          sourceLanguage: options.sourceLang as 'Telugu' | 'English',
          targetLanguage: options.targetLang as 'Telugu' | 'English',
          gradeLevel: grade,
        });
        responseText = translateResponse.translatedText;
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
