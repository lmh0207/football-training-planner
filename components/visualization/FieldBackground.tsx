import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Rect, Circle, Line, Path, G } from "react-native-svg";
import { FieldType } from "@/types/visualization";

interface FieldBackgroundProps {
    fieldType: FieldType;
    width: number;
    height: number;
}

const FIELD_GREEN = "#2D5A27";
const LINE_COLOR = "#FFFFFF";
const LINE_WIDTH = 2;

export function FieldBackground({
    fieldType,
    width,
    height,
}: FieldBackgroundProps) {
    // 최소값 보장
    const safeWidth = Math.max(width, 100);
    const safeHeight = Math.max(height, 75);

    // 필드 비율에 따른 실제 그리기 영역 계산
    const getFieldDimensions = () => {
        switch (fieldType) {
            case "futsal":
                return { ratio: 2 / 1 }; // 40m x 20m
            case "half":
                return { ratio: 1.2 / 1 }; // 약간 세로로 긴 형태
            case "full":
                return { ratio: 1.5 / 1 }; // 105m x 68m
            default:
                return { ratio: 1.5 / 1 };
        }
    };

    const { ratio } = getFieldDimensions();
    const padding = 10;

    // 실제 필드 영역 계산
    let fieldWidth = Math.max(safeWidth - padding * 2, 10);
    let fieldHeight = Math.max(safeHeight - padding * 2, 10);

    if (fieldWidth / fieldHeight > ratio) {
        fieldWidth = fieldHeight * ratio;
    } else {
        fieldHeight = fieldWidth / ratio;
    }

    const offsetX = (safeWidth - fieldWidth) / 2;
    const offsetY = (safeHeight - fieldHeight) / 2;

    const renderFutsalField = () => (
        <G>
            {/* 외곽선 */}
            <Rect
                x={offsetX}
                y={offsetY}
                width={fieldWidth}
                height={fieldHeight}
                fill={FIELD_GREEN}
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 중앙선 */}
            <Line
                x1={offsetX + fieldWidth / 2}
                y1={offsetY}
                x2={offsetX + fieldWidth / 2}
                y2={offsetY + fieldHeight}
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 중앙원 */}
            <Circle
                cx={offsetX + fieldWidth / 2}
                cy={offsetY + fieldHeight / 2}
                r={fieldHeight * 0.15}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 왼쪽 골에어리어 */}
            <Rect
                x={offsetX}
                y={offsetY + fieldHeight * 0.3}
                width={fieldWidth * 0.15}
                height={fieldHeight * 0.4}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 오른쪽 골에어리어 */}
            <Rect
                x={offsetX + fieldWidth * 0.85}
                y={offsetY + fieldHeight * 0.3}
                width={fieldWidth * 0.15}
                height={fieldHeight * 0.4}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
        </G>
    );

    const renderHalfField = () => (
        <G>
            {/* 외곽선 */}
            <Rect
                x={offsetX}
                y={offsetY}
                width={fieldWidth}
                height={fieldHeight}
                fill={FIELD_GREEN}
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 페널티 에어리어 */}
            <Rect
                x={offsetX + fieldWidth * 0.18}
                y={offsetY}
                width={fieldWidth * 0.64}
                height={fieldHeight * 0.3}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 골에어리어 */}
            <Rect
                x={offsetX + fieldWidth * 0.32}
                y={offsetY}
                width={fieldWidth * 0.36}
                height={fieldHeight * 0.12}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 페널티 스팟 */}
            <Circle
                cx={offsetX + fieldWidth / 2}
                cy={offsetY + fieldHeight * 0.2}
                r={3}
                fill={LINE_COLOR}
            />
            {/* 페널티 아크 */}
            <Path
                d={`M ${offsetX + fieldWidth * 0.32} ${offsetY + fieldHeight * 0.3}
                    A ${fieldHeight * 0.15} ${fieldHeight * 0.15} 0 0 0 ${offsetX + fieldWidth * 0.68} ${offsetY + fieldHeight * 0.3}`}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 하프라인 (아래쪽) */}
            <Path
                d={`M ${offsetX} ${offsetY + fieldHeight}
                    A ${fieldHeight * 0.2} ${fieldHeight * 0.2} 0 0 1 ${offsetX + fieldWidth} ${offsetY + fieldHeight}`}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
        </G>
    );

    const renderFullField = () => (
        <G>
            {/* 외곽선 */}
            <Rect
                x={offsetX}
                y={offsetY}
                width={fieldWidth}
                height={fieldHeight}
                fill={FIELD_GREEN}
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 중앙선 */}
            <Line
                x1={offsetX}
                y1={offsetY + fieldHeight / 2}
                x2={offsetX + fieldWidth}
                y2={offsetY + fieldHeight / 2}
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 중앙원 */}
            <Circle
                cx={offsetX + fieldWidth / 2}
                cy={offsetY + fieldHeight / 2}
                r={fieldHeight * 0.12}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 상단 페널티 에어리어 */}
            <Rect
                x={offsetX + fieldWidth * 0.18}
                y={offsetY}
                width={fieldWidth * 0.64}
                height={fieldHeight * 0.16}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 상단 골에어리어 */}
            <Rect
                x={offsetX + fieldWidth * 0.32}
                y={offsetY}
                width={fieldWidth * 0.36}
                height={fieldHeight * 0.06}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 하단 페널티 에어리어 */}
            <Rect
                x={offsetX + fieldWidth * 0.18}
                y={offsetY + fieldHeight * 0.84}
                width={fieldWidth * 0.64}
                height={fieldHeight * 0.16}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
            {/* 하단 골에어리어 */}
            <Rect
                x={offsetX + fieldWidth * 0.32}
                y={offsetY + fieldHeight * 0.94}
                width={fieldWidth * 0.36}
                height={fieldHeight * 0.06}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={LINE_WIDTH}
            />
        </G>
    );

    return (
        <View style={[styles.container, { width: safeWidth, height: safeHeight }]}>
            <Svg width={safeWidth} height={safeHeight}>
                {fieldType === "futsal" && renderFutsalField()}
                {fieldType === "half" && renderHalfField()}
                {fieldType === "full" && renderFullField()}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1a3d16",
    },
});
