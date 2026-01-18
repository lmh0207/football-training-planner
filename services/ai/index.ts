import { AiService } from "../interfaces/AiService";
import { GeminiService } from "./geminiService";
import { OpenAIService } from "./openaiService";
import { getAiConfig } from "@/stores/aiConfigStore";

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

// 간단한 AI 서비스 (프롬프트 전달 후 raw 응답 반환)
class SimpleAiService {
    private async callGemini(prompt: string, apiKey: string): Promise<string> {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 8192,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error("Gemini API 호출 실패");
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    private async callOpenAI(prompt: string, apiKey: string): Promise<string> {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 4096,
            }),
        });

        if (!response.ok) {
            throw new Error("OpenAI API 호출 실패");
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    }

    async generateRawResponse(prompt: string): Promise<string> {
        const config = getAiConfig();

        if (config.provider === "gemini" && config.geminiApiKey) {
            return this.callGemini(prompt, config.geminiApiKey);
        } else if (config.provider === "openai" && config.openaiApiKey) {
            return this.callOpenAI(prompt, config.openaiApiKey);
        }

        throw new Error("AI API 키가 설정되지 않았습니다");
    }
}

export const aiService = new SimpleAiService();

export { GeminiService } from "./geminiService";
export { OpenAIService } from "./openaiService";
export { buildTrainingPrompt, parseAiResponse } from "./prompt";
