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
        diagram?: BlockDiagram;
    }>;
    explanation: string;
    tags?: string[];
}

// 시각화용 다이어그램 타입
export interface BlockDiagram {
    elements: Array<{
        type: "player" | "cone" | "ball" | "goal";
        x: number; // 0-100
        y: number; // 0-100
        label?: string;
        color?: string;
    }>;
    paths: Array<{
        type: "move" | "pass" | "dribble" | "shot";
        fromX: number;
        fromY: number;
        toX: number;
        toY: number;
        label?: string;
        curved?: boolean;
    }>;
    steps?: string[];
}

// 시각화 데이터 생성 프롬프트
export function buildVisualizationPrompt(block: {
    title: string;
    description?: string;
    type: string;
    playerCount: number;
    fieldType: string;
}): string {
    return `당신은 축구 훈련 다이어그램 전문가입니다. 아래 훈련 블록을 시각화해주세요.

## 훈련 정보
- 제목: ${block.title}
- 설명: ${block.description || "없음"}
- 유형: ${block.type}
- 인원: ${block.playerCount}명
- 경기장: ${block.fieldType}

## 응답 형식 (JSON만)
좌표는 0-100 비율입니다. (0,0)은 좌상단, (100,100)은 우하단입니다.

{
  "elements": [
    { "type": "player", "x": 50, "y": 80, "label": "1", "color": "#FF6B6B" },
    { "type": "cone", "x": 30, "y": 50 },
    { "type": "ball", "x": 50, "y": 80 },
    { "type": "goal", "x": 50, "y": 5 }
  ],
  "paths": [
    { "type": "pass", "fromX": 50, "fromY": 80, "toX": 30, "toY": 50, "label": "1" },
    { "type": "move", "fromX": 50, "fromY": 80, "toX": 40, "toY": 60 },
    { "type": "shot", "fromX": 40, "fromY": 30, "toX": 50, "toY": 5 }
  ],
  "steps": [
    "1번이 2번에게 패스",
    "2번이 드리블 후 슈팅"
  ]
}

## 요소 타입
- player: 선수 (label로 번호 표시, color로 팀 구분)
- cone: 콘 (노란색 삼각형)
- ball: 공
- goal: 골대

## 경로 타입
- pass: 패스 (파란색 실선)
- move: 이동 (검정 점선)
- dribble: 드리블 (보라색)
- shot: 슈팅 (빨간색)

훈련 내용을 잘 표현하는 다이어그램을 만들어주세요.`;
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

// 시각화 응답 파싱
export function parseVisualizationResponse(response: string): BlockDiagram {
    const firstBrace = response.indexOf("{");
    const lastBrace = response.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("시각화 응답 파싱 실패");
    }

    const jsonStr = response.substring(firstBrace, lastBrace + 1);

    try {
        const parsed = JSON.parse(jsonStr);

        return {
            elements: (parsed.elements || []).map((el: any) => ({
                type: el.type || "player",
                x: Number(el.x) || 50,
                y: Number(el.y) || 50,
                label: el.label,
                color: el.color,
            })),
            paths: (parsed.paths || []).map((p: any) => ({
                type: p.type || "pass",
                fromX: Number(p.fromX) || 0,
                fromY: Number(p.fromY) || 0,
                toX: Number(p.toX) || 0,
                toY: Number(p.toY) || 0,
                label: p.label,
                curved: p.curved,
            })),
            steps: parsed.steps || [],
        };
    } catch (error) {
        console.error("Failed to parse visualization:", error);
        throw new Error("시각화 응답 파싱 실패");
    }
}
