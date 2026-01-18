import { AiService } from "../interfaces/AiService";
import { GeminiService } from "./geminiService";
import { OpenAIService } from "./openaiService";

export type AiProvider = "gemini" | "openai";

export interface AiConfig {
    provider: AiProvider;
    geminiApiKey?: string;
    openaiApiKey?: string;
}

export function createAiService(config: AiConfig): AiService {
    switch (config.provider) {
        case "gemini":
            if (!config.geminiApiKey) {
                throw new Error("Gemini API key is required");
            }
            return new GeminiService(config.geminiApiKey);

        case "openai":
            if (!config.openaiApiKey) {
                throw new Error("OpenAI API key is required");
            }
            return new OpenAIService(config.openaiApiKey);

        default:
            throw new Error(`Unknown AI provider: ${config.provider}`);
    }
}

export { GeminiService } from "./geminiService";
export { OpenAIService } from "./openaiService";
export { buildTrainingPrompt, parseAiResponse } from "./prompt";
