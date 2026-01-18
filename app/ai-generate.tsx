import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import {
    Text,
    Button,
    Chip,
    SegmentedButtons,
    TextInput,
    ActivityIndicator,
    Surface,
} from "react-native-paper";
import { useRouter } from "expo-router";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useEditorStore } from "@/stores/editorStore";
import { useAiConfig } from "@/stores/aiConfigStore";
import { aiService } from "@/services/ai";
import {
    FieldType,
    DrillElement,
    DrillPath,
    ELEMENT_COLORS,
} from "@/types/visualization";

const TRAINING_GOALS = [
    { id: "passing", label: "패스" },
    { id: "shooting", label: "슈팅" },
    { id: "defense", label: "수비" },
    { id: "possession", label: "점유율" },
    { id: "pressing", label: "압박" },
    { id: "transition", label: "전환" },
    { id: "fitness", label: "체력" },
    { id: "teamwork", label: "팀워크" },
];

const PLAYER_COUNTS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

export default function AiGenerateScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const router = useRouter();

    const { config } = useAiConfig();
    const { fieldType, setFieldType, applyAiResult } = useEditorStore();

    const [playerCount, setPlayerCount] = useState(10);
    const [selectedGoals, setSelectedGoals] = useState<string[]>(["passing"]);
    const [additionalRequest, setAdditionalRequest] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const toggleGoal = (goalId: string) => {
        setSelectedGoals((prev) =>
            prev.includes(goalId)
                ? prev.filter((g) => g !== goalId)
                : [...prev, goalId]
        );
    };

    const handleGenerate = async () => {
        // API 키 확인
        const apiKey =
            config.provider === "gemini"
                ? config.geminiApiKey
                : config.openaiApiKey;

        if (!apiKey) {
            Alert.alert(
                "API 키 필요",
                "설정에서 AI API 키를 먼저 입력해주세요.",
                [
                    { text: "취소", style: "cancel" },
                    { text: "설정으로", onPress: () => router.push("/settings") },
                ]
            );
            return;
        }

        if (selectedGoals.length === 0) {
            Alert.alert("훈련 목표 선택", "최소 하나의 훈련 목표를 선택해주세요.");
            return;
        }

        setIsLoading(true);

        try {
            // AI 프롬프트 구성
            const prompt = buildTacticBoardPrompt({
                playerCount,
                fieldType,
                goals: selectedGoals,
                additionalRequest,
            });

            // AI 호출
            const response = await aiService.generateRawResponse(prompt);

            // 응답 파싱
            const result = parseTacticBoardResponse(response, playerCount);

            // 에디터에 적용
            applyAiResult(result);

            // 화면 닫기
            router.back();
        } catch (error) {
            console.error("AI generation error:", error);
            Alert.alert(
                "생성 실패",
                "AI 훈련 생성에 실패했습니다. 다시 시도해주세요."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* 인원수 */}
            <Surface style={[styles.section, { backgroundColor: colors.card }]} elevation={1}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
                    인원수
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                        {PLAYER_COUNTS.map((count) => (
                            <Chip
                                key={count}
                                selected={playerCount === count}
                                onPress={() => setPlayerCount(count)}
                                style={styles.chip}
                                showSelectedCheck={false}
                                mode={playerCount === count ? "flat" : "outlined"}>
                                {count}명
                            </Chip>
                        ))}
                    </View>
                </ScrollView>
            </Surface>

            {/* 경기장 */}
            <Surface style={[styles.section, { backgroundColor: colors.card }]} elevation={1}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
                    경기장
                </Text>
                <SegmentedButtons
                    value={fieldType}
                    onValueChange={(value) => setFieldType(value as FieldType)}
                    buttons={[
                        { value: "futsal", label: "풋살장" },
                        { value: "half", label: "하프" },
                        { value: "full", label: "풀코트" },
                    ]}
                />
            </Surface>

            {/* 훈련 목표 */}
            <Surface style={[styles.section, { backgroundColor: colors.card }]} elevation={1}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
                    훈련 목표 (다중 선택)
                </Text>
                <View style={styles.chipGrid}>
                    {TRAINING_GOALS.map((goal) => (
                        <Chip
                            key={goal.id}
                            selected={selectedGoals.includes(goal.id)}
                            onPress={() => toggleGoal(goal.id)}
                            style={styles.chip}
                            showSelectedCheck
                            mode={selectedGoals.includes(goal.id) ? "flat" : "outlined"}>
                            {goal.label}
                        </Chip>
                    ))}
                </View>
            </Surface>

            {/* 추가 요청 */}
            <Surface style={[styles.section, { backgroundColor: colors.card }]} elevation={1}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
                    추가 요청 (선택)
                </Text>
                <TextInput
                    mode="outlined"
                    placeholder="예: 수비 조직력 강화, 역습 훈련 포함"
                    value={additionalRequest}
                    onChangeText={setAdditionalRequest}
                    multiline
                    numberOfLines={3}
                />
            </Surface>

            {/* 생성 버튼 */}
            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={handleGenerate}
                    loading={isLoading}
                    disabled={isLoading || selectedGoals.length === 0}
                    style={styles.generateButton}
                    contentStyle={styles.generateButtonContent}>
                    {isLoading ? "생성 중..." : "AI 훈련 생성"}
                </Button>
            </View>

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        AI가 훈련을 구성하고 있습니다...
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

// AI 프롬프트 빌더
function buildTacticBoardPrompt(params: {
    playerCount: number;
    fieldType: FieldType;
    goals: string[];
    additionalRequest?: string;
}): string {
    const goalLabels = params.goals
        .map((g) => TRAINING_GOALS.find((tg) => tg.id === g)?.label || g)
        .join(", ");

    return `당신은 축구 전술 전문가입니다. 아래 조건에 맞는 훈련 배치를 설계해주세요.

## 조건
- 인원수: ${params.playerCount}명
- 경기장: ${params.fieldType === "futsal" ? "풋살장" : params.fieldType === "half" ? "하프 코트" : "풀 코트"}
- 훈련 목표: ${goalLabels}
${params.additionalRequest ? `- 추가 요청: ${params.additionalRequest}` : ""}

## 응답 형식 (반드시 JSON만 응답)
좌표는 0-100 비율입니다. (0,0)은 좌상단, (100,100)은 우하단입니다.

{
  "elements": [
    { "type": "player", "x": 50, "y": 80, "label": "1", "team": "teamA" },
    { "type": "player", "x": 30, "y": 60, "label": "2", "team": "teamA" },
    { "type": "player", "x": 50, "y": 40, "label": "1", "team": "teamB" },
    { "type": "cone", "x": 40, "y": 50 },
    { "type": "ball", "x": 50, "y": 80 },
    { "type": "goal", "x": 50, "y": 5 }
  ],
  "paths": [
    { "type": "pass", "fromX": 50, "fromY": 80, "toX": 30, "toY": 60, "label": "1" },
    { "type": "move", "fromX": 50, "fromY": 80, "toX": 40, "toY": 70 },
    { "type": "shot", "fromX": 40, "fromY": 30, "toX": 50, "toY": 5 }
  ],
  "comment": "이 훈련의 목적과 실행 방법에 대한 상세 설명"
}

## 요소 타입
- player: 선수 (label로 번호, team으로 팀 구분 - teamA: 빨강, teamB: 청록)
- cone: 콘
- ball: 공
- goal: 골대
- pole: 막대기

## 경로 타입
- pass: 패스 (파란색)
- move: 이동 (검정 점선)
- dribble: 드리블 (보라색)
- shot: 슈팅 (빨간색)

## 주의사항
- 인원수에 맞게 선수를 배치하세요 (팀 A와 팀 B로 나눠서)
- 훈련 목표에 맞는 전술적 배치를 하세요
- 경로는 훈련 순서대로 label을 붙여주세요
- comment에 훈련 방법과 코칭 포인트를 상세히 설명해주세요

JSON만 응답하세요. 다른 텍스트는 포함하지 마세요.`;
}

// AI 응답 파서
function parseTacticBoardResponse(
    response: string,
    playerCount: number
): {
    elements: DrillElement[];
    paths: DrillPath[];
    comment: string;
} {
    // JSON 추출
    const firstBrace = response.indexOf("{");
    const lastBrace = response.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("Invalid AI response format");
    }

    const jsonStr = response.substring(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonStr);

    // 요소 변환
    const elements: DrillElement[] = (parsed.elements || []).map(
        (el: any, index: number) => ({
            id: `ai-element-${index}-${Date.now()}`,
            type: el.type || "player",
            position: {
                x: Number(el.x) || 50,
                y: Number(el.y) || 50,
            },
            label: el.label,
            team: el.team,
            color:
                el.type === "player"
                    ? el.team === "teamB"
                        ? ELEMENT_COLORS.teamB
                        : ELEMENT_COLORS.teamA
                    : undefined,
        })
    );

    // 경로 변환
    const paths: DrillPath[] = (parsed.paths || []).map(
        (p: any, index: number) => ({
            id: `ai-path-${index}-${Date.now()}`,
            type: p.type || "pass",
            from: {
                x: Number(p.fromX) || 0,
                y: Number(p.fromY) || 0,
            },
            to: {
                x: Number(p.toX) || 0,
                y: Number(p.toY) || 0,
            },
            label: p.label,
        })
    );

    return {
        elements,
        paths,
        comment: parsed.comment || "AI가 생성한 훈련입니다.",
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        margin: 16,
        marginBottom: 8,
        padding: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontWeight: "600",
        marginBottom: 12,
    },
    chipRow: {
        flexDirection: "row",
        gap: 8,
    },
    chipGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        marginBottom: 4,
    },
    buttonContainer: {
        padding: 16,
        paddingTop: 8,
    },
    generateButton: {
        borderRadius: 12,
    },
    generateButtonContent: {
        paddingVertical: 8,
    },
    loadingOverlay: {
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
    },
});
