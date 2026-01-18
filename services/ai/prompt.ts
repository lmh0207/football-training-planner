import {
    FIELD_TYPE_LABELS,
    TEAM_LEVEL_LABELS,
    TRAINING_GOAL_LABELS,
    TrainingConditions,
} from "@/types/training";

export function buildTrainingPrompt(conditions: TrainingConditions): string {
    const goalLabels = conditions.goals
        .map((g) => TRAINING_GOAL_LABELS[g])
        .join(", ");

    return `당신은 전문 축구 코치입니다. 아래 조건에 맞는 훈련 세션을 설계해주세요.

## 훈련 조건
- 인원수: ${conditions.playerCount}명
- 총 훈련 시간: ${conditions.totalDuration}분
- 경기장: ${FIELD_TYPE_LABELS[conditions.fieldType]}
- 팀 레벨: ${TEAM_LEVEL_LABELS[conditions.teamLevel]}
- 훈련 목표: ${goalLabels}
- 골키퍼: ${conditions.hasGoalkeeper ? "있음" : "없음"}
- 부상자: ${conditions.hasInjuredPlayers ? "있음 (강도 조절 필요)" : "없음"}

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{
  "title": "훈련 세션 제목",
  "blocks": [
    {
      "type": "warmup | main | game | cooldown",
      "title": "블록 제목",
      "duration": 시간(분),
      "description": "설명",
      "coachingPoints": ["코칭 포인트1", "코칭 포인트2"],
      "intensity": "low | medium | high"
    }
  ],
  "explanation": "이 훈련을 이렇게 구성한 이유 설명",
  "tags": ["태그1", "태그2"]
}

## 설계 원칙
1. 워밍업(10-15분) → 메인 훈련 → 게임 → 쿨다운(5-10분) 순서로 구성
2. 총 시간을 정확히 맞출 것
3. 팀 레벨에 맞는 난이도 설정
4. 훈련 목표가 메인 훈련에 반영되도록 구성
5. 부상자가 있으면 전체 강도를 낮추고 대안 동작 제시
6. 인원수에 맞는 그룹/팀 구성 고려
7. 각 블록에 2-3개의 구체적인 코칭 포인트 포함`;
}

export interface ParsedAiResponse {
    title: string;
    blocks: Array<{
        type: "warmup" | "main" | "game" | "cooldown";
        title: string;
        duration: number;
        description?: string;
        coachingPoints?: string[];
        intensity: "low" | "medium" | "high";
    }>;
    explanation: string;
    tags?: string[];
}

export function buildAdvicePrompt(session: {
    title: string;
    conditions: { totalDuration: number; playerCount: number; goals: string[] };
    blocks: Array<{ title: string; duration: number; intensity: string }>;
}): string {
    return `당신은 전문 축구 코치입니다. 아래 훈련 세션을 분석하고 개선점을 제안해주세요.

## 훈련 세션
제목: ${session.title}
총 시간: ${session.conditions.totalDuration}분
인원: ${session.conditions.playerCount}명
목표: ${session.conditions.goals.join(", ")}

블록:
${session.blocks.map((b, i) => `${i + 1}. ${b.title} (${b.duration}분, 강도: ${b.intensity})`).join("\n")}

## 응답 형식 (JSON만 응답)
{
  "advices": [
    {
      "type": "warning | suggestion | info",
      "title": "조언 제목",
      "message": "상세 설명"
    }
  ]
}`;
}

export function buildExplanationPrompt(session: {
    title: string;
    conditions: { totalDuration: number; playerCount: number; goals: string[] };
    blocks: Array<{ title: string; duration: number }>;
}): string {
    return `당신은 전문 축구 코치입니다. 아래 훈련 세션이 왜 이렇게 구성되었는지 설명해주세요.

## 훈련 세션
제목: ${session.title}
총 시간: ${session.conditions.totalDuration}분
인원: ${session.conditions.playerCount}명
목표: ${session.conditions.goals.join(", ")}

블록:
${session.blocks.map((b, i) => `${i + 1}. ${b.title} (${b.duration}분)`).join("\n")}

2-3문장으로 간결하게 설명해주세요.`;
}

export function parseAiResponse(response: string): ParsedAiResponse {
    // 가장 간단한 방법: { 부터 마지막 } 까지 추출
    const firstBrace = response.indexOf("{");
    const lastBrace = response.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        console.error("No JSON object found in response");
        throw new Error("AI 응답에서 JSON을 찾을 수 없습니다");
    }

    const jsonStr = response.substring(firstBrace, lastBrace + 1);

    try {
        const parsed = JSON.parse(jsonStr);

        // 기본 검증
        if (!parsed.title || !Array.isArray(parsed.blocks)) {
            throw new Error("Invalid response format");
        }

        return {
            title: parsed.title,
            blocks: parsed.blocks.map((block: any, index: number) => ({
                type: block.type || "main",
                title: block.title || `블록 ${index + 1}`,
                duration: Number(block.duration) || 10,
                description: block.description,
                coachingPoints: block.coachingPoints || [],
                intensity: block.intensity || "medium",
            })),
            explanation: parsed.explanation || "AI가 생성한 훈련 세션입니다.",
            tags: parsed.tags || [],
        };
    } catch (error) {
        console.error("Failed to parse AI response:", error);
        throw new Error("AI 응답 파싱 실패");
    }
}
