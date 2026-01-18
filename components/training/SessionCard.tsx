import { View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { FIELD_TYPE_LABELS, TrainingSession } from "@/types/training";
import { StyleSheet } from "react-native";
import { Card, Chip, IconButton, Text } from "react-native-paper";

interface SessionCardProps {
    session: TrainingSession;
    onPress: () => void;
    onFavoriteToggle?: () => void;
}

export function SessionCard({
    session,
    onPress,
    onFavoriteToggle,
}: SessionCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    const formatDate = (date: Date) => {
        const d = new Date(date);
        return `${d.getMonth() + 1}월 ${d.getDate()}일`;
    };

    return (
        <Card
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={onPress}
            mode="elevated">
            <Card.Content>
                <View style={styles.header}>
                    <View style={styles.titleRow}>
                        <Text
                            variant="titleMedium"
                            style={[styles.title, { color: colors.text }]}>
                            {session.title}
                        </Text>
                        {session.isAiGenerated && (
                            <Chip
                                compact
                                style={[
                                    styles.aiChip,
                                    { backgroundColor: colors.primary + "20" },
                                ]}
                                textStyle={{
                                    color: colors.primary,
                                    fontSize: 10,
                                    lineHeight: 12,
                                    textAlign: "center",
                                }}>
                                AI
                            </Chip>
                        )}
                    </View>
                    <IconButton
                        icon={session.isFavorite ? "star" : "star-outline"}
                        iconColor={
                            session.isFavorite
                                ? "#F59E0B"
                                : colors.textSecondary
                        }
                        size={20}
                        onPress={onFavoriteToggle}
                        style={styles.favoriteButton}
                    />
                </View>

                <Text
                    variant="bodySmall"
                    style={[styles.date, { color: colors.textSecondary }]}>
                    {formatDate(session.createdAt)}
                </Text>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text
                            variant="bodySmall"
                            style={{ color: colors.textSecondary }}>
                            👥 {session.conditions.playerCount}명
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text
                            variant="bodySmall"
                            style={{ color: colors.textSecondary }}>
                            ⏱️ {session.conditions.totalDuration}분
                        </Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text
                            variant="bodySmall"
                            style={{ color: colors.textSecondary }}>
                            🏟️ {FIELD_TYPE_LABELS[session.conditions.fieldType]}
                        </Text>
                    </View>
                </View>

                {session.tags && session.tags.length > 0 && (
                    <View style={styles.tagsRow}>
                        {session.tags.slice(0, 3).map((tag) => (
                            <Chip
                                key={tag}
                                compact
                                style={[
                                    styles.tag,
                                    { backgroundColor: colors.border },
                                ]}
                                textStyle={{
                                    color: colors.textSecondary,
                                    fontSize: 11,
                                    lineHeight: 13,
                                    textAlign: "center",
                                }}>
                                {tag}
                            </Chip>
                        ))}
                    </View>
                )}
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        backgroundColor: "transparent",
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        backgroundColor: "transparent",
    },
    title: {
        fontWeight: "600",
        marginRight: 8,
    },
    aiChip: {
        alignSelf: "flex-start",
    },
    favoriteButton: {
        margin: -8,
    },
    date: {
        marginTop: 4,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: "row",
        backgroundColor: "transparent",
    },
    infoItem: {
        marginRight: 16,
        backgroundColor: "transparent",
    },
    tagsRow: {
        flexDirection: "row",
        marginTop: 12,
        backgroundColor: "transparent",
    },
    tag: {
        marginRight: 6,
    },
});
