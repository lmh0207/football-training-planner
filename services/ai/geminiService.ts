import { AiAdvice, AiGenerateResponse } from "@/types/ai";
import { TrainingConditions, TrainingSession } from "@/types/training";
import { AiService } from "../interfaces/AiService";
import {
    buildAdvicePrompt,
    buildExplanationPrompt,
    buildTrainingPrompt,
    parseAiResponse,
} from "./prompt";

const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export class GeminiService implements AiService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateSession(
        conditions: TrainingConditions
    ): Promise<AiGenerateResponse> {
        const prompt = buildTrainingPrompt(conditions);

        const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Gemini API error:", error);
            throw new Error("Gemini API 호출 실패");
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
            throw new Error("Gemini 응답이 비어있습니다");
        }

        const parsed = parseAiResponse(textContent);

        return {
            session: {
                title: parsed.title,
                conditions,
                blocks: parsed.blocks.map((block, index) => ({
                    id: `block-${Date.now()}-${index}`,
                    ...block,
                })),
                isAiGenerated: true,
                aiExplanation: parsed.explanation,
                isFavorite: false,
                tags: parsed.tags,
            },
            explanation: parsed.explanation,
        };
    }

    async getAdvice(session: TrainingSession): Promise<AiAdvice[]> {
        const prompt = buildAdvicePrompt(session);

        const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!response.ok) {
            throw new Error("Gemini API 호출 실패");
        }

        const data = await response.json();
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        try {
            const jsonMatch = textContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return (parsed.advices || []).map(
                    (advice: any, index: number) => ({
                        id: `advice-${Date.now()}-${index}`,
                        type: advice.type || "info",
                        title: advice.title,
                        message: advice.message,
                    })
                );
            }
        } catch (e) {
            console.error("Failed to parse advice:", e);
        }

        return [];
    }

    async getExplanation(session: TrainingSession): Promise<string> {
        if (session.aiExplanation) {
            return session.aiExplanation;
        }

        const prompt = buildExplanationPrompt(session);

        const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 256,
                },
            }),
        });

        if (!response.ok) {
            throw new Error("Gemini API 호출 실패");
        }

        const data = await response.json();
        return (
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "설명을 생성할 수 없습니다."
        );
    }
}
