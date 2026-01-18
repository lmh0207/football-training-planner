// 시각화 요소 타입들

export type FieldType = "futsal" | "half" | "full";

// 좌표 (0-100 비율 기준)
export interface Position {
    x: number; // 0-100
    y: number; // 0-100
}

// 팀 구분
export type Team = "teamA" | "teamB" | "neutral";

// 선수/콘 등 요소
export type ElementType = "player" | "cone" | "ball" | "goal" | "pole";

export interface DrillElement {
    id: string;
    type: ElementType;
    position: Position;
    label?: string; // 선수 번호 등
    color?: string; // 팀 구분용
    team?: Team; // 선수 팀 구분
    rotation?: number; // 회전 각도 (막대기, 골대용)
}

// 이동/패스 경로
export type PathType = "move" | "pass" | "dribble" | "shot";

export interface DrillPath {
    id: string;
    type: PathType;
    from: Position;
    to: Position;
    curved?: boolean; // 곡선 여부
    label?: string; // 순서 번호 등
}

// 하나의 훈련 다이어그램
export interface DrillDiagram {
    id: string;
    title: string;
    description?: string;
    fieldType: FieldType;
    elements: DrillElement[];
    paths: DrillPath[];
    steps?: string[]; // 단계별 설명
}

// AI 응답에 포함될 시각화 데이터
export interface DrillVisualization {
    diagrams: DrillDiagram[];
}

// 에디터 모드
export type EditMode =
    | "select" // 기본 선택/이동 모드
    | "draw_pass" // 패스 경로 그리기
    | "draw_move" // 이동 경로 그리기
    | "draw_dribble" // 드리블 경로 그리기
    | "draw_shot" // 슈팅 경로 그리기
    | "delete"; // 삭제 모드

// 경로 그리기 상태
export interface PathDrawingState {
    type: PathType;
    fromPosition: Position;
    fromElementId?: string; // 요소에서 시작한 경우
}

// AI 생성 결과
export interface AiGeneratedBoard {
    elements: DrillElement[];
    paths: DrillPath[];
    comment: string;
    steps?: string[];
}

// 도구 팔레트 아이템
export interface ToolItem {
    id: string;
    type: "element" | "path" | "action";
    elementType?: ElementType;
    pathType?: PathType;
    team?: Team;
    icon: string;
    label: string;
    color: string;
}

// 색상 상수
export const ELEMENT_COLORS = {
    teamA: "#FF6B6B", // 빨강
    teamB: "#4ECDC4", // 청록
    cone: "#FFE66D", // 노랑
    ball: "#FFFFFF", // 흰색
    goal: "#2ECC71", // 초록
    pole: "#8B4513", // 갈색 (막대기)
    neutral: "#9CA3AF", // 회색 (중립)
};

export const PATH_COLORS = {
    move: "#333333", // 검정 (이동)
    pass: "#3498DB", // 파랑 (패스)
    dribble: "#9B59B6", // 보라 (드리블)
    shot: "#E74C3C", // 빨강 (슈팅)
};

// 도구 목록
export const TOOL_ITEMS: ToolItem[] = [
    // 요소 도구
    {
        id: "player_a",
        type: "element",
        elementType: "player",
        team: "teamA",
        icon: "account",
        label: "팀A",
        color: ELEMENT_COLORS.teamA,
    },
    {
        id: "player_b",
        type: "element",
        elementType: "player",
        team: "teamB",
        icon: "account",
        label: "팀B",
        color: ELEMENT_COLORS.teamB,
    },
    {
        id: "cone",
        type: "element",
        elementType: "cone",
        icon: "triangle",
        label: "콘",
        color: ELEMENT_COLORS.cone,
    },
    {
        id: "ball",
        type: "element",
        elementType: "ball",
        icon: "soccer",
        label: "공",
        color: ELEMENT_COLORS.ball,
    },
    {
        id: "goal",
        type: "element",
        elementType: "goal",
        icon: "soccer-field",
        label: "골대",
        color: ELEMENT_COLORS.goal,
    },
    {
        id: "pole",
        type: "element",
        elementType: "pole",
        icon: "drag-vertical",
        label: "막대",
        color: ELEMENT_COLORS.pole,
    },
    // 경로 도구
    {
        id: "path_pass",
        type: "path",
        pathType: "pass",
        icon: "arrow-right-bold",
        label: "패스",
        color: PATH_COLORS.pass,
    },
    {
        id: "path_move",
        type: "path",
        pathType: "move",
        icon: "run",
        label: "이동",
        color: PATH_COLORS.move,
    },
    {
        id: "path_dribble",
        type: "path",
        pathType: "dribble",
        icon: "transit-connection-variant",
        label: "드리블",
        color: PATH_COLORS.dribble,
    },
    {
        id: "path_shot",
        type: "path",
        pathType: "shot",
        icon: "target",
        label: "슈팅",
        color: PATH_COLORS.shot,
    },
    // 액션 도구
    {
        id: "delete",
        type: "action",
        icon: "delete",
        label: "삭제",
        color: "#EF4444",
    },
];
