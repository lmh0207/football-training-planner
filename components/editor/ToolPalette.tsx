import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { IconButton, Text, Surface } from "react-native-paper";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useEditorStore } from "@/stores/editorStore";
import { TOOL_ITEMS, EditMode, ToolItem } from "@/types/visualization";

interface ToolButtonProps {
    tool: ToolItem;
    isActive: boolean;
    onPress: () => void;
    onLongPress?: () => void;
}

function ToolButton({ tool, isActive, onPress, onLongPress }: ToolButtonProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    return (
        <View style={styles.toolItem}>
            <IconButton
                icon={tool.icon}
                iconColor={isActive ? "#fff" : tool.color}
                containerColor={isActive ? tool.color : colors.card}
                size={24}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[
                    styles.toolButton,
                    isActive && styles.activeToolButton,
                ]}
            />
            <Text
                variant="labelSmall"
                style={[styles.toolLabel, { color: colors.textSecondary }]}>
                {tool.label}
            </Text>
        </View>
    );
}

interface ToolPaletteProps {
    onToolSelect: (tool: ToolItem) => void;
    selectedToolId: string | null;
}

export function ToolPalette({ onToolSelect, selectedToolId }: ToolPaletteProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const { editMode, setEditMode } = useEditorStore();

    const elementTools = TOOL_ITEMS.filter((t) => t.type === "element");
    const pathTools = TOOL_ITEMS.filter((t) => t.type === "path");
    const actionTools = TOOL_ITEMS.filter((t) => t.type === "action");

    const handleToolPress = (tool: ToolItem) => {
        if (tool.type === "element") {
            // 요소 도구 선택 - select 모드로 변경하고 도구 선택
            setEditMode("select");
            onToolSelect(tool);
        } else if (tool.type === "path") {
            // 경로 도구 - 해당 경로 그리기 모드로 변경
            const modeMap: Record<string, EditMode> = {
                pass: "draw_pass",
                move: "draw_move",
                dribble: "draw_dribble",
                shot: "draw_shot",
            };
            setEditMode(modeMap[tool.pathType!] || "select");
            onToolSelect(tool);
        } else if (tool.type === "action") {
            if (tool.id === "delete") {
                setEditMode("delete");
            }
            onToolSelect(tool);
        }
    };

    const isToolActive = (tool: ToolItem) => {
        if (tool.type === "element") {
            return selectedToolId === tool.id && editMode === "select";
        }
        if (tool.type === "path") {
            const modeMap: Record<string, EditMode> = {
                pass: "draw_pass",
                move: "draw_move",
                dribble: "draw_dribble",
                shot: "draw_shot",
            };
            return editMode === modeMap[tool.pathType!];
        }
        if (tool.id === "delete") {
            return editMode === "delete";
        }
        return false;
    };

    return (
        <Surface style={[styles.container, { backgroundColor: colors.card }]} elevation={2}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 요소 도구 */}
                <Text
                    variant="labelSmall"
                    style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    요소
                </Text>
                <View style={styles.toolGrid}>
                    {elementTools.map((tool) => (
                        <ToolButton
                            key={tool.id}
                            tool={tool}
                            isActive={isToolActive(tool)}
                            onPress={() => handleToolPress(tool)}
                        />
                    ))}
                </View>

                {/* 구분선 */}
                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* 경로 도구 */}
                <Text
                    variant="labelSmall"
                    style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    경로
                </Text>
                <View style={styles.toolGrid}>
                    {pathTools.map((tool) => (
                        <ToolButton
                            key={tool.id}
                            tool={tool}
                            isActive={isToolActive(tool)}
                            onPress={() => handleToolPress(tool)}
                        />
                    ))}
                </View>

                {/* 구분선 */}
                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                {/* 액션 도구 */}
                <Text
                    variant="labelSmall"
                    style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    액션
                </Text>
                <View style={styles.toolGrid}>
                    {actionTools.map((tool) => (
                        <ToolButton
                            key={tool.id}
                            tool={tool}
                            isActive={isToolActive(tool)}
                            onPress={() => handleToolPress(tool)}
                        />
                    ))}
                </View>
            </ScrollView>
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 80,
        paddingVertical: 8,
        borderRadius: 12,
    },
    sectionTitle: {
        textAlign: "center",
        marginTop: 8,
        marginBottom: 4,
        fontSize: 10,
    },
    toolGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    toolItem: {
        alignItems: "center",
        marginVertical: 4,
        width: "50%",
    },
    toolButton: {
        margin: 0,
    },
    activeToolButton: {
        borderWidth: 2,
        borderColor: "#fff",
    },
    toolLabel: {
        fontSize: 9,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginVertical: 8,
        marginHorizontal: 12,
    },
});
