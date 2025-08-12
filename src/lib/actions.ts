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
  summary?: string; // for summarization safeguard
};

type AIOptions = {
  sourceLang?: string;
  targetLang?: string;
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1200): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      // If this looks like a transient fetch/503 error, backoff and retry
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = /503|fetch failed|ECONNRESET|ETIMEDOUT|network/i.test(msg);
      if (i < retries - 1 && isTransient) {
        await new Promise(res => setTimeout(res, delayMs * (i + 1)));
        continue;
      }
      break;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
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
    const emotionPromise = withRetry(() => inferStudentEmotion({ studentInput: prompt }));

    switch (feature) {
      case "chat":
        const chatResponse = await withRetry(() => casualChat({
            message: prompt,
            gradeLevel: grade,
        }));
        responseText = chatResponse.response;
        break;
      case "ask":
        const askResponse = await withRetry(() => answerQuestion({
          question: prompt,
          gradeLevel: grade,
        }));
        responseText = askResponse.answer;
        break;
      case "summarize":
        const summaryResponse = await withRetry(() => summarizeTextbookContent({
          textbookContent: prompt,
        }));
        responseText = summaryResponse.summary;
        break;
      case "image":
        const imageResponse = await withRetry(() => generateImageFromTeluguText({
          teluguText: prompt,
        }));
        imageUrl = imageResponse.imageDataUri;
        responseText = `Here is the image you requested for: "${prompt}"`;
        break;
      case "translate":
        const sourceLang = prompt.match(/[a-zA-Z]/) ? 'English' : 'Telugu';
        const targetLang = sourceLang === 'English' ? 'Telugu' : 'English';

        const translateResponse = await withRetry(() => translateText({
          text: prompt,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          gradeLevel: grade,
        }));
        responseText = translateResponse.translatedText;
        break;
      default:
        // Default to chat if feature is unknown
        const defaultResponse = await withRetry(() => casualChat({
            message: prompt,
            gradeLevel: grade,
        }));
        responseText = defaultResponse.response;
    }

    const emotionResult = await emotionPromise;

    return {
      responseText,
      imageUrl,
      emotion: emotionResult.emotion,
    };
  } catch (error) {
    console.error("AI action error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { error: `An error occurred while processing your request: ${errorMessage}` };
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
