import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Chip, IconButton, Text } from "react-native-paper";

import { View } from "@/components/Themed";
import { BlockCard } from "@/components/training/BlockCard";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { FIELD_TYPE_LABELS, TEAM_LEVEL_LABELS } from "@/types/training";
import { mockSessions } from "@/utils/mockData";

export default function SessionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    const session = mockSessions.find((s) => s.id === id);
    const [showExplanation, setShowExplanation] = useState(false);

    if (!session) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}>
                <Text style={{ color: colors.text }}>
                    세션을 찾을 수 없습니다.
                </Text>
            </View>
        );
    }

    const totalDuration = session.blocks.reduce(
        (sum, b) => sum + b.duration,
        0
    );

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}>
            {/* 세션 정보 헤더 */}
            <Card style={[styles.headerCard, { backgroundColor: colors.card }]}>
                <Card.Content>
                    <View style={styles.titleRow}>
                        <Text
                            variant="headlineSmall"
                            style={[styles.title, { color: colors.text }]}>
                            {session.title}
                        </Text>
                        <IconButton
                            icon={session.isFavorite ? "star" : "star-outline"}
                            iconColor={
                                session.isFavorite
                                    ? "#F59E0B"
                                    : colors.textSecondary
                            }
                            size={24}
                        />
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text
                                variant="titleLarge"
                                style={{ color: colors.primary }}>
                                {session.conditions.playerCount}
                            </Text>
                            <Text
                                variant="bodySmall"
                                style={{ color: colors.textSecondary }}>
                                인원
                            </Text>
                        </View>
                        <View style={styles.stat}>
                            <Text
                                variant="titleLarge"
                                style={{ color: colors.primary }}>
                                {totalDuration}
                            </Text>
                            <Text
                                variant="bodySmall"
                                style={{ color: colors.textSecondary }}>
                                분
                            </Text>
                        </View>
                        <View style={styles.stat}>
                            <Text
                                variant="titleLarge"
                                style={{ color: colors.primary }}>
                                {session.blocks.length}
                            </Text>
                            <Text
                                variant="bodySmall"
                                style={{ color: colors.textSecondary }}>
                                블록
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tagsRow}>
                        <Chip compact textStyle={styles.infoChipText}>
                            {FIELD_TYPE_LABELS[session.conditions.fieldType]}
                        </Chip>
                        <Chip compact textStyle={styles.infoChipText}>
                            {TEAM_LEVEL_LABELS[session.conditions.teamLevel]}
                        </Chip>
                        {session.conditions.hasGoalkeeper && (
                            <Chip compact textStyle={styles.infoChipText}>
                                GK 있음
                            </Chip>
                        )}
                    </View>
                </Card.Content>
            </Card>

            {/* AI 설명 */}
            {session.isAiGenerated && session.aiExplanation && (
                <Card
                    style={[
                        styles.aiCard,
                        { backgroundColor: colors.primary + "10" },
                    ]}>
                    <Card.Content>
                        <View style={styles.aiHeader}>
                            <View style={styles.aiTitleRow}>
                                <Text
                                    variant="titleSmall"
                                    style={{ color: colors.primary }}>
                                    🤖 AI 훈련 설계 이유
                                </Text>
                            </View>
                            <IconButton
                                icon={
                                    showExplanation
                                        ? "chevron-up"
                                        : "chevron-down"
                                }
                                iconColor={colors.primary}
                                size={20}
                                onPress={() =>
                                    setShowExplanation(!showExplanation)
                                }
                            />
                        </View>
                        {showExplanation && (
                            <Text
                                variant="bodyMedium"
                                style={[
                                    styles.aiExplanation,
                                    { color: colors.text },
                                ]}>
                                {session.aiExplanation}
                            </Text>
                        )}
                    </Card.Content>
                </Card>
            )}

            {/* 훈련 블록 타임라인 */}
            <View style={styles.blocksSection}>
                <Text
                    variant="titleMedium"
                    style={[styles.sectionTitle, { color: colors.text }]}>
                    훈련 순서
                </Text>
                {session.blocks.map((block, index) => (
                    <BlockCard
                        key={block.id}
                        block={block}
                        index={index}
                        onPress={() => {
                            // TODO: 블록 편집 모달
                        }}
                    />
                ))}
            </View>

            {/* 하단 버튼 */}
            <View style={styles.bottomButtons}>
                <Button
                    mode="outlined"
                    onPress={() => router.back()}
                    style={styles.button}
                    textColor={colors.primary}>
                    목록으로
                </Button>
                <Button
                    mode="contained"
                    onPress={() => {
                        // TODO: 훈련 시작 기능
                    }}
                    style={[
                        styles.button,
                        { backgroundColor: colors.primary },
                    ]}>
                    훈련 시작
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerCard: {
        margin: 16,
        borderRadius: 16,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    title: {
        fontWeight: "700",
        flex: 1,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 16,
        paddingVertical: 16,
        backgroundColor: "transparent",
    },
    stat: {
        alignItems: "center",
        backgroundColor: "transparent",
    },
    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 8,
        backgroundColor: "transparent",
    },
    infoChipText: {
        fontSize: 12,
        lineHeight: 14,
        textAlign: "center" as const,
    },
    aiCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
    },
    aiHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    aiTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    aiExplanation: {
        marginTop: 8,
        lineHeight: 22,
    },
    blocksSection: {
        marginTop: 8,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontWeight: "600",
        marginLeft: 16,
        marginBottom: 12,
    },
    bottomButtons: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
        backgroundColor: "transparent",
    },
    button: {
        flex: 1,
        borderRadius: 12,
    },
});
