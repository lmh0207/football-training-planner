import { View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import {
  BLOCK_TYPE_LABELS,
  BlockType,
  INTENSITY_LABELS,
  TrainingBlock,
} from "@/types/training";
import { StyleSheet } from "react-native";
import { Card, Chip, Text } from "react-native-paper";

interface BlockCardProps {
    block: TrainingBlock;
    index: number;
    onPress?: () => void;
}

const BLOCK_TYPE_COLORS: Record<BlockType, string> = {
    warmup: "#F59E0B",
    main: "#22C55E",
    game: "#3B82F6",
    cooldown: "#8B5CF6",
};

export function BlockCard({ block, index, onPress }: BlockCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const blockColor = BLOCK_TYPE_COLORS[block.type];

    return (
        <Card
            style={[styles.card, { backgroundColor: colors.card }]}
            onPress={onPress}
            mode="elevated">
            <View style={[styles.timeline, { backgroundColor: blockColor }]} />
            <Card.Content style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.indexContainer}>
                        <Text
                            style={[
                                styles.index,
                                { color: colors.textSecondary },
                            ]}>
                            {index + 1}
                        </Text>
                    </View>
                    <View style={styles.info}>
                        <Chip
                            compact
                            style={[
                                styles.typeChip,
                                { backgroundColor: blockColor + "20" },
                            ]}
                            textStyle={{
                                color: blockColor,
                                fontSize: 10,
                                fontWeight: "600",
                                lineHeight: 12,
                                textAlign: "center",
                            }}>
                            {BLOCK_TYPE_LABELS[block.type]}
                        </Chip>
                        <Text
                            variant="titleSmall"
                            style={[styles.title, { color: colors.text }]}>
                            {block.title}
                        </Text>
                    </View>
                    <View style={styles.meta}>
                        <Text
                            variant="bodySmall"
                            style={{ color: colors.textSecondary }}>
                            {block.duration}분
                        </Text>
                        <Chip
                            compact
                            style={[
                                styles.intensityChip,
                                {
                                    backgroundColor:
                                        block.intensity === "high"
                                            ? colors.error + "20"
                                            : block.intensity === "medium"
                                            ? colors.warning + "20"
                                            : colors.success + "20",
                                },
                            ]}
                            textStyle={{
                                fontSize: 9,
                                color:
                                    block.intensity === "high"
                                        ? colors.error
                                        : block.intensity === "medium"
                                        ? colors.warning
                                        : colors.success,
                            }}>
                            {INTENSITY_LABELS[block.intensity]}
                        </Chip>
                    </View>
                </View>

                {block.description && (
                    <Text
                        variant="bodySmall"
                        style={[
                            styles.description,
                            { color: colors.textSecondary },
                        ]}
                        numberOfLines={2}>
                        {block.description}
                    </Text>
                )}

                {block.coachingPoints && block.coachingPoints.length > 0 && (
                    <View style={styles.coachingPoints}>
                        {block.coachingPoints.slice(0, 2).map((point, i) => (
                            <Text
                                key={i}
                                variant="bodySmall"
                                style={{ color: colors.primary }}>
                                • {point}
                            </Text>
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
        marginVertical: 6,
        borderRadius: 12,
        overflow: "hidden",
    },
    timeline: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    content: {
        paddingLeft: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "transparent",
    },
    indexContainer: {
        width: 24,
        backgroundColor: "transparent",
    },
    index: {
        fontSize: 14,
        fontWeight: "600",
    },
    info: {
        flex: 1,
        backgroundColor: "transparent",
    },
    typeChip: {
        alignSelf: "flex-start",
    },
    title: {
        fontWeight: "600",
    },
    meta: {
        alignItems: "flex-end",
        backgroundColor: "transparent",
    },
    intensityChip: {
        marginTop: 4,
    },
    description: {
        marginTop: 8,
        marginLeft: 24,
    },
    coachingPoints: {
        marginTop: 8,
        marginLeft: 24,
        backgroundColor: "transparent",
    },
});
