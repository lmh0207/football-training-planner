import { Position } from "@/types/visualization";

// 필드 비율(0-100) → 화면 픽셀
export function ratioToPixel(
    position: Position,
    fieldWidth: number,
    fieldHeight: number,
    padding: number = 10
): { x: number; y: number } {
    return {
        x: padding + (position.x / 100) * (fieldWidth - padding * 2),
        y: padding + (position.y / 100) * (fieldHeight - padding * 2),
    };
}

// 화면 픽셀 → 필드 비율(0-100)
export function pixelToRatio(
    x: number,
    y: number,
    fieldWidth: number,
    fieldHeight: number,
    padding: number = 10
): Position {
    return {
        x: Math.max(
            0,
            Math.min(100, ((x - padding) / (fieldWidth - padding * 2)) * 100)
        ),
        y: Math.max(
            0,
            Math.min(100, ((y - padding) / (fieldHeight - padding * 2)) * 100)
        ),
    };
}

// 두 점 사이의 거리 계산
export function distance(p1: Position, p2: Position): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// 점이 요소 범위 내에 있는지 확인 (히트 테스트)
export function isPointInElement(
    point: Position,
    elementPosition: Position,
    hitRadius: number = 5 // 비율 좌표 기준
): boolean {
    return distance(point, elementPosition) <= hitRadius;
}
