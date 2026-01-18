import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import {
    ActivityIndicator,
    Button,
    Chip,
    SegmentedButtons,
    Switch,
    Text,
} from "react-native-paper";

import { View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { createAiService } from "@/services/ai";
import { useAiConfig } from "@/stores/aiConfigStore";
import {
    FIELD_TYPE_LABELS,
    FieldType,
    TEAM_LEVEL_LABELS,
    TeamLevel,
    TRAINING_GOAL_LABELS,
    TrainingConditions,
    TrainingGoal,
} from "@/types/training";
import { mockSessions } from "@/utils/mockData";

const DURATION_OPTIONS = [30, 60, 90, 120];
const PLAYER_COUNT_OPTIONS = [6, 8, 10, 12, 14, 16, 18, 20, 22];

export default function CreateScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const { config } = useAiConfig();

    // 폼 상태
    const [playerCount, setPlayerCount] = useState(10);
    const [duration, setDuration] = useState(60);
    const [fieldType, setFieldType] = useState<FieldType>("half");
    const [teamLevel, setTeamLevel] = useState<TeamLevel>("amateur");
    const [goals, setGoals] = useState<TrainingGoal[]>([]);
    const [hasGoalkeeper, setHasGoalkeeper] = useState(false);
    const [hasInjuredPlayers, setHasInjuredPlayers] = useState(false);

    // 로딩 상태
    const [isLoading, setIsLoading] = useState(false);

    const toggleGoal = (goal: TrainingGoal) => {
        setGoals((prev) =>
            prev.includes(goal)
                ? prev.filter((g) => g !== goal)
                : [...prev, goal]
        );
    };

    const handleGenerate = async () => {
        const apiKey =
            config.provider === "gemini"
                ? config.geminiApiKey
                : config.openaiApiKey;

        // API 키가 없으면 mock 데이터 사용
        if (!apiKey) {
            Alert.alert(
                "API 키 필요",
                "설정에서 AI API 키를 입력해주세요.\n\n테스트를 위해 샘플 세션을 표시합니다.",
                [
                    {
                        text: "설정으로 이동",
                        onPress: () => router.push("/(tabs)/settings"),
                    },
                    {
                        text: "샘플 보기",
                        onPress: () => router.push("/session/session-1"),
                    },
                ]
            );
            return;
        }

        const conditions: TrainingConditions = {
            playerCount,
            totalDuration: duration,
            fieldType,
            teamLevel,
            goals,
            hasGoalkeeper,
            hasInjuredPlayers,
        };

        setIsLoading(true);

        try {
            const aiService = createAiService({
                provider: config.provider,
                geminiApiKey: config.geminiApiKey,
                openaiApiKey: config.openaiApiKey,
            });

            const result = await aiService.generateSession(conditions);

            // 생성된 세션을 mockSessions에 임시 저장 (추후 실제 저장소로 변경)
            const newSession = {
                ...result.session,
                id: `session-${Date.now()}`,
                userId: "user-1",
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // mockData에 추가 (임시)
            mockSessions.unshift(newSession);

            // 생성된 세션 상세 페이지로 이동
            router.replace(`/session/${newSession.id}`);
        } catch (error) {
            console.error("AI generation error:", error);
            Alert.alert(
                "생성 실패",
                error instanceof Error
                    ? error.message
                    : "AI 훈련 생성에 실패했습니다. 다시 시도해주세요."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const isValid = goals.length > 0;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}>
            {/* 인원수 */}
            <View style={styles.section}>
                <Text
                    variant="titleMedium"
                    style={[styles.sectionTitle, { color: colors.text }]}>
                    인원수
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                        {PLAYER_COUNT_OPTIONS.map((count) => (
                            <Chip
                                key={count}
                                selected={playerCount === count}
                                onPress={() => setPlayerCount(count)}
                                style={styles.chip}
                                selectedColor={colors.primary}
                                disabled={isLoading}>
                                {count}명
                            </Chip>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* 훈련 시간 */}
            <View style={styles.section}>
                <Text
                    variant="titleMedium"
                    style={[styles.sectionTitle, { color: colors.text }]}>
                    훈련 시간
                </Text>
                <SegmentedButtons
                    value={duration.toString()}
                    onValueChange={(value) => setDuration(Number(value))}
                    buttons={DURATION_OPTIONS.map((d) => ({
                        value: d.toString(),
                        label: `${d}분`,
                        disabled: isLoading,
                    }))}
                    style={styles.segmented}
                />
            </View>

            {/* 경기장 유형 */}
            <View style={styles.section}>
                <Text
                    variant="titleMedium"
                    style={[styles.sectionTitle, { color: colors.text }]}>
                    경기장 유형
                </Text>
                <SegmentedButtons
                    value={fieldType}
                    onValueChange={(value) => setFieldType(value as FieldType)}
                    buttons={Object.entries(FIELD_TYPE_LABELS).map(
                        ([key, label]) => ({
                            value: key,
                            label,
                            disabled: isLoading,
                        })
                    )}
                    style={styles.segmented}
                />
            </View>

            {/* 팀 레벨 */}
            <View style={styles.section}>
                <Text
                    variant="titleMedium"
                    style={[styles.sectionTitle, { color: colors.text }]}>
                    팀 레벨
                </Text>
                <SegmentedButtons
                    value={teamLevel}
                    onValueChange={(value) => setTeamLevel(value as TeamLevel)}
                    buttons={Object.entries(TEAM_LEVEL_LABELS).map(
                        ([key, label]) => ({
                            value: key,
                            label,
                            disabled: isLoading,
                        })
                    )}
                    style={styles.segmented}
                />
            </View>

            {/* 훈련 목표 */}
            <View style={styles.section}>
                <Text
                    variant="titleMedium"
                    style={[styles.sectionTitle, { color: colors.text }]}>
                    훈련 목표 (1개 이상 선택)
                </Text>
                <View style={styles.goalsGrid}>
                    {(
                        Object.entries(TRAINING_GOAL_LABELS) as [
                            TrainingGoal,
                            string,
                        ][]
                    ).map(([key, label]) => (
                        <Chip
                            key={key}
                            selected={goals.includes(key)}
                            onPress={() => toggleGoal(key)}
                            style={styles.goalChip}
                            selectedColor={colors.primary}
                            disabled={isLoading}>
                            {label}
                        </Chip>
                    ))}
                </View>
            </View>

            {/* 추가 옵션 */}
            <View style={styles.section}>
                <Text
                    variant="titleMedium"
                    style={[styles.sectionTitle, { color: colors.text }]}>
                    추가 옵션
                </Text>
                <View
                    style={[
                        styles.optionRow,
                        { backgroundColor: colors.card },
                    ]}>
                    <Text style={{ color: colors.text }}>골키퍼 있음</Text>
                    <Switch
                        value={hasGoalkeeper}
                        onValueChange={setHasGoalkeeper}
                        color={colors.primary}
                        disabled={isLoading}
                    />
                </View>
                <View
                    style={[
                        styles.optionRow,
                        { backgroundColor: colors.card },
                    ]}>
                    <Text style={{ color: colors.text }}>부상자 있음</Text>
                    <Switch
                        value={hasInjuredPlayers}
                        onValueChange={setHasInjuredPlayers}
                        color={colors.primary}
                        disabled={isLoading}
                    />
                </View>
            </View>

            {/* 생성 버튼 */}
            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={handleGenerate}
                    disabled={!isValid || isLoading}
                    style={[
                        styles.button,
                        {
                            backgroundColor:
                                isValid && !isLoading
                                    ? colors.primary
                                    : colors.border,
                        },
                    ]}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator
                                size="small"
                                color="#fff"
                                style={styles.loadingIndicator}
                            />
                            <Text style={styles.loadingText}>
                                AI가 훈련을 생성 중...
                            </Text>
                        </View>
                    ) : (
                        "AI 훈련 생성하기"
                    )}
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        padding: 16,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontWeight: "600",
        marginBottom: 12,
    },
    chipRow: {
        flexDirection: "row",
        gap: 8,
        backgroundColor: "transparent",
    },
    chip: {
        marginRight: 4,
    },
    segmented: {
        marginTop: 4,
    },
    goalsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        backgroundColor: "transparent",
    },
    goalChip: {
        marginBottom: 4,
    },
    optionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    buttonContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    button: {
        borderRadius: 12,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    loadingIndicator: {
        marginRight: 8,
    },
    loadingText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
