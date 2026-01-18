import React from "react";
import Svg, {
    Circle,
    Polygon,
    Text as SvgText,
    G,
    Defs,
    Marker,
    Line,
    Path,
} from "react-native-svg";
import {
    DrillElement,
    DrillPath,
    Position,
    ELEMENT_COLORS,
    PATH_COLORS,
} from "@/types/visualization";

interface DrillElementsProps {
    elements: DrillElement[];
    paths: DrillPath[];
    width: number;
    height: number;
    padding?: number;
}

// 비율 좌표(0-100)를 실제 픽셀로 변환
function toPixel(
    pos: Position,
    width: number,
    height: number,
    padding: number
): { x: number; y: number } {
    const fieldWidth = width - padding * 2;
    const fieldHeight = height - padding * 2;
    return {
        x: padding + (pos.x / 100) * fieldWidth,
        y: padding + (pos.y / 100) * fieldHeight,
    };
}

// 선수 컴포넌트
function Player({
    x,
    y,
    label,
    color = ELEMENT_COLORS.teamA,
}: {
    x: number;
    y: number;
    label?: string;
    color?: string;
}) {
    return (
        <G>
            <Circle cx={x} cy={y} r={14} fill={color} stroke="#fff" strokeWidth={2} />
            {label && (
                <SvgText
                    x={x}
                    y={y + 5}
                    fontSize={12}
                    fontWeight="bold"
                    fill="#fff"
                    textAnchor="middle">
                    {label}
                </SvgText>
            )}
        </G>
    );
}

// 콘 컴포넌트 (삼각형)
function Cone({ x, y }: { x: number; y: number }) {
    const size = 10;
    const points = `${x},${y - size} ${x - size},${y + size} ${x + size},${y + size}`;
    return (
        <Polygon
            points={points}
            fill={ELEMENT_COLORS.cone}
            stroke="#E67E22"
            strokeWidth={2}
        />
    );
}

// 공 컴포넌트
function Ball({ x, y }: { x: number; y: number }) {
    return (
        <G>
            <Circle cx={x} cy={y} r={8} fill={ELEMENT_COLORS.ball} stroke="#333" strokeWidth={1} />
            {/* 공 무늬 */}
            <Circle cx={x} cy={y} r={4} fill="none" stroke="#333" strokeWidth={0.5} />
        </G>
    );
}

// 골대 컴포넌트
function Goal({ x, y }: { x: number; y: number }) {
    return (
        <G>
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
}

// 경로(화살표) 컴포넌트
function DrillPathLine({
    from,
    to,
    type,
    curved,
    label,
    width,
    height,
    padding,
}: {
    from: Position;
    to: Position;
    type: DrillPath["type"];
    curved?: boolean;
    label?: string;
    width: number;
    height: number;
    padding: number;
}) {
    const fromPx = toPixel(from, width, height, padding);
    const toPx = toPixel(to, width, height, padding);
    const color = PATH_COLORS[type];
    const isDashed = type === "move";

    // 화살표 머리 계산
    const angle = Math.atan2(toPx.y - fromPx.y, toPx.x - fromPx.x);
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6;

    const arrowX1 = toPx.x - arrowLength * Math.cos(angle - arrowAngle);
    const arrowY1 = toPx.y - arrowLength * Math.sin(angle - arrowAngle);
    const arrowX2 = toPx.x - arrowLength * Math.cos(angle + arrowAngle);
    const arrowY2 = toPx.y - arrowLength * Math.sin(angle + arrowAngle);

    if (curved) {
        // 곡선 경로
        const midX = (fromPx.x + toPx.x) / 2;
        const midY = (fromPx.y + toPx.y) / 2;
        const controlX = midX + (toPx.y - fromPx.y) * 0.3;
        const controlY = midY - (toPx.x - fromPx.x) * 0.3;

        return (
            <G>
                <Path
                    d={`M ${fromPx.x} ${fromPx.y} Q ${controlX} ${controlY} ${toPx.x} ${toPx.y}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={2.5}
                    strokeDasharray={isDashed ? "8,4" : undefined}
                />
                <Polygon
                    points={`${toPx.x},${toPx.y} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
                    fill={color}
                />
            </G>
        );
    }

    return (
        <G>
            <Line
                x1={fromPx.x}
                y1={fromPx.y}
                x2={toPx.x}
                y2={toPx.y}
                stroke={color}
                strokeWidth={2.5}
                strokeDasharray={isDashed ? "8,4" : undefined}
            />
            <Polygon
                points={`${toPx.x},${toPx.y} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
                fill={color}
            />
            {label && (
                <G>
                    <Circle
                        cx={(fromPx.x + toPx.x) / 2}
                        cy={(fromPx.y + toPx.y) / 2}
                        r={10}
                        fill="#FFE66D"
                    />
                    <SvgText
                        x={(fromPx.x + toPx.x) / 2}
                        y={(fromPx.y + toPx.y) / 2 + 4}
                        fontSize={10}
                        fontWeight="bold"
                        fill="#333"
                        textAnchor="middle">
                        {label}
                    </SvgText>
                </G>
            )}
        </G>
    );
}

export function DrillElements({
    elements,
    paths,
    width,
    height,
    padding = 10,
}: DrillElementsProps) {
    return (
        <Svg
            width={width}
            height={height}
            style={{ position: "absolute", top: 0, left: 0 }}>
            {/* 경로 먼저 그리기 (요소 아래에) */}
            {paths.map((path) => (
                <DrillPathLine
                    key={path.id}
                    from={path.from}
                    to={path.to}
                    type={path.type}
                    curved={path.curved}
                    label={path.label}
                    width={width}
                    height={height}
                    padding={padding}
                />
            ))}

            {/* 요소들 그리기 */}
            {elements.map((element) => {
                const { x, y } = toPixel(element.position, width, height, padding);

                switch (element.type) {
                    case "player":
                        return (
                            <Player
                                key={element.id}
                                x={x}
                                y={y}
                                label={element.label}
                                color={element.color}
                            />
                        );
                    case "cone":
                        return <Cone key={element.id} x={x} y={y} />;
                    case "ball":
                        return <Ball key={element.id} x={x} y={y} />;
                    case "goal":
                        return <Goal key={element.id} x={x} y={y} />;
                    default:
                        return null;
                }
            })}
        </Svg>
    );
}
