import React, { useCallback, useRef } from "react";
import { StyleSheet, View, useWindowDimensions, Pressable, Text } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Svg, {
    Circle,
    G,
    Line,
    Polygon,
    Rect,
    Text as SvgText,
} from "react-native-svg";

import { FieldBackground } from "@/components/visualization/FieldBackground";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useEditorStore } from "@/stores/editorStore";
import {
    DrillElement,
    DrillPath,
    EditMode,
    ELEMENT_COLORS,
    PATH_COLORS,
    PathDrawingState,
    ToolItem,
    PathType,
} from "@/types/visualization";
import { pixelToRatio, ratioToPixel } from "@/utils/coordinates";

interface TacticBoardProps {
    selectedTool: ToolItem | null;
    onElementPlaced: () => void;
}

// 모드 텍스트 컴포넌트
function ModeText({
    editMode,
    pathDrawingState,
}: {
    editMode: EditMode;
    pathDrawingState: PathDrawingState | null;
}) {
    let text = "";
    if (editMode === "delete") {
        text = "삭제 모드 - 요소를 탭하면 삭제됩니다";
    } else if (editMode.startsWith("draw_")) {
        text = pathDrawingState ? "끝점을 탭하세요" : "시작점을 탭하세요";
    }
    return <Text style={styles.modeText}>{text}</Text>;
}

// 요소 렌더링 컴포넌트
function ElementRenderer({
    element,
    fieldWidth,
    fieldHeight,
    isSelected,
    onPress,
}: {
    element: DrillElement;
    fieldWidth: number;
    fieldHeight: number;
    isSelected: boolean;
    onPress: () => void;
}) {
    const { x, y } = ratioToPixel(element.position, fieldWidth, fieldHeight);

    const renderElement = () => {
        switch (element.type) {
            case "player":
                return (
                    <G>
                        {isSelected && (
                            <Circle
                                cx={x}
                                cy={y}
                                r={18}
                                fill="none"
                                stroke="#FFD700"
                                strokeWidth={3}
                            />
                        )}
                        <Circle
                            cx={x}
                            cy={y}
                            r={14}
                            fill={element.color || ELEMENT_COLORS.teamA}
                            stroke="#fff"
                            strokeWidth={2}
                        />
                        {element.label && (
                            <SvgText
                                x={x}
                                y={y + 5}
                                fontSize={12}
                                fontWeight="bold"
                                fill="#fff"
                                textAnchor="middle">
                                {element.label}
                            </SvgText>
                        )}
                    </G>
                );
            case "cone":
                const coneSize = 10;
                const conePoints = `${x},${y - coneSize} ${x - coneSize},${y + coneSize} ${x + coneSize},${y + coneSize}`;
                return (
                    <G>
                        {isSelected && (
                            <Circle
                                cx={x}
                                cy={y}
                                r={16}
                                fill="none"
                                stroke="#FFD700"
                                strokeWidth={3}
                            />
                        )}
                        <Polygon
                            points={conePoints}
                            fill={ELEMENT_COLORS.cone}
                            stroke="#E67E22"
                            strokeWidth={2}
                        />
                    </G>
                );
            case "ball":
                return (
                    <G>
                        {isSelected && (
                            <Circle
                                cx={x}
                                cy={y}
                                r={14}
                                fill="none"
                                stroke="#FFD700"
                                strokeWidth={3}
                            />
                        )}
                        <Circle
                            cx={x}
                            cy={y}
                            r={8}
                            fill={ELEMENT_COLORS.ball}
                            stroke="#333"
                            strokeWidth={1}
                        />
                        <Circle cx={x} cy={y} r={4} fill="none" stroke="#333" strokeWidth={0.5} />
                    </G>
                );
            case "goal":
                return (
                    <G>
                        {isSelected && (
                            <Rect
                                x={x - 24}
                                y={y - 4}
                                width={48}
                                height={18}
                                fill="none"
                                stroke="#FFD700"
                                strokeWidth={3}
                            />
                        )}
                        <Line
                            x1={x - 20}
                            y1={y}
                            x2={x + 20}
                            y2={y}
                            stroke={ELEMENT_COLORS.goal}
                            strokeWidth={4}
                        />
                        <Line
                            x1={x - 20}
                            y1={y}
                            x2={x - 20}
                            y2={y + 10}
                            stroke={ELEMENT_COLORS.goal}
                            strokeWidth={4}
                        />
                        <Line
                            x1={x + 20}
                            y1={y}
                            x2={x + 20}
                            y2={y + 10}
                            stroke={ELEMENT_COLORS.goal}
                            strokeWidth={4}
                        />
                    </G>
                );
            case "pole":
                return (
                    <G>
                        {isSelected && (
                            <Rect
                                x={x - 6}
                                y={y - 16}
                                width={12}
                                height={32}
                                fill="none"
                                stroke="#FFD700"
                                strokeWidth={3}
                            />
                        )}
                        <Rect
                            x={x - 3}
                            y={y - 12}
                            width={6}
                            height={24}
                            fill={ELEMENT_COLORS.pole}
                            stroke="#5D3A1A"
                            strokeWidth={1}
                        />
                    </G>
                );
            default:
                return null;
        }
    };

    return (
        <G onPress={onPress}>
            {renderElement()}
        </G>
    );
}

// 경로 렌더링 컴포넌트
function PathRenderer({
    path,
    fieldWidth,
    fieldHeight,
    isSelected,
    onPress,
}: {
    path: DrillPath;
    fieldWidth: number;
    fieldHeight: number;
    isSelected: boolean;
    onPress: () => void;
}) {
    const from = ratioToPixel(path.from, fieldWidth, fieldHeight);
    const to = ratioToPixel(path.to, fieldWidth, fieldHeight);
    const color = PATH_COLORS[path.type];
    const isDashed = path.type === "move";

    // 화살표 머리 계산
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6;

    const arrowX1 = to.x - arrowLength * Math.cos(angle - arrowAngle);
    const arrowY1 = to.y - arrowLength * Math.sin(angle - arrowAngle);
    const arrowX2 = to.x - arrowLength * Math.cos(angle + arrowAngle);
    const arrowY2 = to.y - arrowLength * Math.sin(angle + arrowAngle);

    return (
        <G onPress={onPress}>
            {isSelected && (
                <Line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#FFD700"
                    strokeWidth={6}
                />
            )}
            <Line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={color}
                strokeWidth={2.5}
                strokeDasharray={isDashed ? "8,4" : undefined}
            />
            <Polygon
                points={`${to.x},${to.y} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
                fill={color}
            />
            {path.label && (
                <G>
                    <Circle
                        cx={(from.x + to.x) / 2}
                        cy={(from.y + to.y) / 2}
                        r={10}
                        fill="#FFE66D"
                    />
                    <SvgText
                        x={(from.x + to.x) / 2}
                        y={(from.y + to.y) / 2 + 4}
                        fontSize={10}
                        fontWeight="bold"
                        fill="#333"
                        textAnchor="middle">
                        {path.label}
                    </SvgText>
                </G>
            )}
        </G>
    );
}

export function TacticBoard({ selectedTool, onElementPlaced }: TacticBoardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const {
        fieldType,
        elements,
        paths,
        selectedElementId,
        selectedPathId,
        editMode,
        pathDrawingState,
        addElement,
        updateElementPosition,
        removeElement,
        removePath,
        selectElement,
        selectPath,
        clearSelection,
        startPathDrawing,
        completePathDrawing,
        cancelPathDrawing,
    } = useEditorStore();

    // 필드 크기 계산 (최소값 보장)
    const boardWidth = Math.max(screenWidth - 100, 200); // 사이드바 공간 제외
    const boardHeight = Math.max(screenHeight - 200, 200); // 헤더, 코멘트 공간 제외
    const fieldWidth = Math.max(Math.min(boardWidth - 20, 500), 100);
    const fieldHeight = Math.max(fieldWidth * 0.75, 75);

    const boardRef = useRef<View>(null);

    // 보드 탭 처리
    const handleBoardTap = useCallback(
        (tapX: number, tapY: number) => {
            const position = pixelToRatio(tapX, tapY, fieldWidth, fieldHeight);

            if (editMode === "select" && selectedTool?.type === "element") {
                // 요소 배치
                addElement(
                    selectedTool.elementType!,
                    position,
                    selectedTool.team
                );
                onElementPlaced();
            } else if (
                editMode.startsWith("draw_") &&
                !pathDrawingState
            ) {
                // 경로 그리기 시작
                const pathType = editMode.replace("draw_", "") as PathType;
                startPathDrawing(pathType, position);
            } else if (pathDrawingState) {
                // 경로 그리기 완료
                completePathDrawing(position);
            } else {
                // 선택 해제
                clearSelection();
            }
        },
        [
            editMode,
            selectedTool,
            pathDrawingState,
            fieldWidth,
            fieldHeight,
            addElement,
            startPathDrawing,
            completePathDrawing,
            clearSelection,
            onElementPlaced,
        ]
    );

    // 요소 탭 처리
    const handleElementTap = useCallback(
        (element: DrillElement) => {
            if (editMode === "delete") {
                removeElement(element.id);
            } else if (editMode === "select") {
                selectElement(element.id);
            } else if (editMode.startsWith("draw_")) {
                const pathType = editMode.replace("draw_", "") as PathType;
                if (!pathDrawingState) {
                    startPathDrawing(pathType, element.position, element.id);
                } else {
                    completePathDrawing(element.position);
                }
            }
        },
        [
            editMode,
            pathDrawingState,
            removeElement,
            selectElement,
            startPathDrawing,
            completePathDrawing,
        ]
    );

    // 경로 탭 처리
    const handlePathTap = useCallback(
        (path: DrillPath) => {
            if (editMode === "delete") {
                removePath(path.id);
            } else if (editMode === "select") {
                selectPath(path.id);
            }
        },
        [editMode, removePath, selectPath]
    );

    // 요소 드래그 처리를 위한 상태
    const draggingElementId = useSharedValue<string | null>(null);
    const dragOffset = useSharedValue({ x: 0, y: 0 });

    return (
        <View style={styles.container}>
            <Pressable
                ref={boardRef}
                style={[
                    styles.board,
                    {
                        width: fieldWidth,
                        height: fieldHeight,
                        backgroundColor: colors.card,
                    },
                ]}
                onPress={(event) => {
                    const { locationX, locationY } = event.nativeEvent;
                    handleBoardTap(locationX, locationY);
                }}>
                {/* 필드 배경 */}
                <FieldBackground
                    fieldType={fieldType}
                    width={fieldWidth}
                    height={fieldHeight}
                />

                {/* SVG 오버레이 */}
                <Svg
                    width={fieldWidth}
                    height={fieldHeight}
                    style={styles.svgOverlay}>
                    {/* 경로 먼저 그리기 */}
                    {paths.map((path) => (
                        <PathRenderer
                            key={path.id}
                            path={path}
                            fieldWidth={fieldWidth}
                            fieldHeight={fieldHeight}
                            isSelected={path.id === selectedPathId}
                            onPress={() => handlePathTap(path)}
                        />
                    ))}

                    {/* 경로 그리기 중 미리보기 */}
                    {pathDrawingState && (
                        <Circle
                            cx={ratioToPixel(pathDrawingState.fromPosition, fieldWidth, fieldHeight).x}
                            cy={ratioToPixel(pathDrawingState.fromPosition, fieldWidth, fieldHeight).y}
                            r={8}
                            fill={PATH_COLORS[pathDrawingState.type]}
                            opacity={0.5}
                        />
                    )}

                    {/* 요소들 그리기 */}
                    {elements.map((element) => (
                        <ElementRenderer
                            key={element.id}
                            element={element}
                            fieldWidth={fieldWidth}
                            fieldHeight={fieldHeight}
                            isSelected={element.id === selectedElementId}
                            onPress={() => handleElementTap(element)}
                        />
                    ))}
                </Svg>
            </Pressable>

            {/* 현재 모드 표시 */}
            {editMode !== "select" && (
                <View style={[styles.modeIndicator, { backgroundColor: colors.primary }]}>
                    <ModeText
                        editMode={editMode}
                        pathDrawingState={pathDrawingState}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    board: {
        borderRadius: 8,
        overflow: "hidden",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    svgOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    modeIndicator: {
        position: "absolute",
        bottom: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    modeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
});
