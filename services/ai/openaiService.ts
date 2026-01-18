import { AiAdvice, AiGenerateResponse } from "@/types/ai";
import { TrainingConditions, TrainingSession } from "@/types/training";
import { AiService } from "../interfaces/AiService";
import {
    buildAdvicePrompt,
    buildExplanationPrompt,
    buildTrainingPrompt,
    parseAiResponse,
} from "./prompt";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAIService implements AiService {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model: string = "gpt-4o-mini") {
        this.apiKey = apiKey;
        this.model = model;
    }

    async generateSession(
        conditions: TrainingConditions
    ): Promise<AiGenerateResponse> {
        const prompt = buildTrainingPrompt(conditions);

        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content:
                            "당신은 전문 축구 코치입니다. 요청된 조건에 맞는 훈련 세션을 JSON 형식으로만 응답합니다.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 2048,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("OpenAI API error:", error);
            throw new Error("OpenAI API 호출 실패");
        }

        const data = await response.json();
        const textContent = data.choices?.[0]?.message?.content;

        if (!textContent) {
            throw new Error("OpenAI 응답이 비어있습니다");
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

        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content:
                            "당신은 전문 축구 코치입니다. JSON 형식으로만 응답합니다.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            throw new Error("OpenAI API 호출 실패");
        }

        const data = await response.json();
        const textContent = data.choices?.[0]?.message?.content;

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

        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: "당신은 전문 축구 코치입니다.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 256,
            }),
        });

        if (!response.ok) {
            throw new Error("OpenAI API 호출 실패");
        }

        const data = await response.json();
        return (
            data.choices?.[0]?.message?.content || "설명을 생성할 수 없습니다."
        );
    }
}
