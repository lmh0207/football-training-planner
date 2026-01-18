import React, { useState, useCallback } from "react";
import { StyleSheet, View, SafeAreaView, Alert } from "react-native";
import {
    Appbar,
    SegmentedButtons,
    IconButton,
    Portal,
    Dialog,
    Button,
    Text,
} from "react-native-paper";
import { useRouter } from "expo-router";

import { ToolPalette } from "@/components/editor/ToolPalette";
import { TacticBoard } from "@/components/editor/TacticBoard";
import { CommentSection } from "@/components/editor/CommentSection";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useEditorStore } from "@/stores/editorStore";
import { FieldType, ToolItem } from "@/types/visualization";

export default function TacticBoardScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const router = useRouter();

    const { fieldType, setFieldType, clear, setEditMode, elements, paths } =
        useEditorStore();

    const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
    const [showClearDialog, setShowClearDialog] = useState(false);

    const handleToolSelect = useCallback((tool: ToolItem) => {
        if (tool.type === "element") {
            setSelectedTool(tool);
        } else if (tool.type === "path" || tool.type === "action") {
            setSelectedTool(tool);
        }
    }, []);

    const handleElementPlaced = useCallback(() => {
        // 요소 배치 후 도구 선택 유지 (연속 배치 가능)
    }, []);

    const handleClear = useCallback(() => {
        if (elements.length > 0 || paths.length > 0) {
            setShowClearDialog(true);
        }
    }, [elements.length, paths.length]);

    const confirmClear = useCallback(() => {
        clear();
        setSelectedTool(null);
        setEditMode("select");
        setShowClearDialog(false);
    }, [clear, setEditMode]);

    const handleAiGenerate = useCallback(() => {
        router.push("/ai-generate");
    }, [router]);

    const handleSettings = useCallback(() => {
        router.push("/settings");
    }, [router]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* 상단 헤더 */}
            <Appbar.Header style={{ backgroundColor: colors.card }} elevated>
                <Appbar.Content title="전술 보드" titleStyle={{ fontWeight: "700" }} />
                <Appbar.Action icon="robot" onPress={handleAiGenerate} />
                <Appbar.Action icon="refresh" onPress={handleClear} />
                <Appbar.Action icon="cog" onPress={handleSettings} />
            </Appbar.Header>

            {/* 필드 타입 선택 */}
            <View style={[styles.fieldSelector, { backgroundColor: colors.card }]}>
                <SegmentedButtons
                    value={fieldType}
                    onValueChange={(value) => setFieldType(value as FieldType)}
                    buttons={[
                        { value: "futsal", label: "풋살장" },
                        { value: "half", label: "하프" },
                        { value: "full", label: "풀코트" },
                    ]}
                    style={styles.segmentedButtons}
                />
            </View>

            {/* 메인 콘텐츠 */}
            <View style={styles.mainContent}>
                {/* 도구 팔레트 */}
                <View style={styles.paletteContainer}>
                    <ToolPalette
                        onToolSelect={handleToolSelect}
                        selectedToolId={selectedTool?.id || null}
                    />
                </View>

                {/* 전술 보드 */}
                <View style={styles.boardContainer}>
                    <TacticBoard
                        selectedTool={selectedTool}
                        onElementPlaced={handleElementPlaced}
                    />
                </View>
            </View>

            {/* 코멘트 섹션 */}
            <View style={styles.commentContainer}>
                <CommentSection />
            </View>

            {/* 초기화 확인 다이얼로그 */}
            <Portal>
                <Dialog visible={showClearDialog} onDismiss={() => setShowClearDialog(false)}>
                    <Dialog.Title>보드 초기화</Dialog.Title>
                    <Dialog.Content>
                        <Text>모든 요소와 경로가 삭제됩니다. 계속하시겠습니까?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowClearDialog(false)}>취소</Button>
                        <Button onPress={confirmClear} textColor={colors.error}>
                            초기화
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fieldSelector: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    segmentedButtons: {
        alignSelf: "center",
    },
    mainContent: {
        flex: 1,
        flexDirection: "row",
        paddingHorizontal: 8,
        paddingTop: 8,
    },
    paletteContainer: {
        marginRight: 8,
    },
    boardContainer: {
        flex: 1,
    },
    commentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
});
