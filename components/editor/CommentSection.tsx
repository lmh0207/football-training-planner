import React from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, Text, Surface } from "react-native-paper";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useEditorStore } from "@/stores/editorStore";

export function CommentSection() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const { comment, setComment } = useEditorStore();

    return (
        <Surface style={[styles.container, { backgroundColor: colors.card }]} elevation={2}>
            <Text variant="labelMedium" style={[styles.label, { color: colors.textSecondary }]}>
                훈련 설명
            </Text>
            <TextInput
                mode="outlined"
                placeholder="이 훈련에 대한 설명을 입력하세요..."
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={2}
                style={styles.input}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                textColor={colors.text}
            />
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    label: {
        marginBottom: 4,
    },
    input: {
        maxHeight: 80,
        fontSize: 14,
    },
});
