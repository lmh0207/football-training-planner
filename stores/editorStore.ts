import { create } from "zustand";
import { Platform } from "react-native";
import {
    AiGeneratedBoard,
    DrillElement,
    DrillPath,
    EditMode,
    FieldType,
    PathDrawingState,
    Position,
    Team,
    ElementType,
    PathType,
    ELEMENT_COLORS,
} from "@/types/visualization";

// 고유 ID 생성
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface EditorState {
    // 필드 설정
    fieldType: FieldType;

    // 요소들
    elements: DrillElement[];
    paths: DrillPath[];

    // 선택 상태
    selectedElementId: string | null;
    selectedPathId: string | null;

    // 편집 모드
    editMode: EditMode;
    pathDrawingState: PathDrawingState | null;

    // 코멘트
    comment: string;

    // 선수 번호 카운터
    playerCounters: { teamA: number; teamB: number };

    // 액션들
    setFieldType: (type: FieldType) => void;

    // 요소 관련
    addElement: (
        type: ElementType,
        position: Position,
        team?: Team
    ) => string;
    updateElementPosition: (id: string, position: Position) => void;
    removeElement: (id: string) => void;

    // 경로 관련
    addPath: (type: PathType, from: Position, to: Position) => string;
    removePath: (id: string) => void;

    // 선택 관련
    selectElement: (id: string | null) => void;
    selectPath: (id: string | null) => void;
    clearSelection: () => void;

    // 편집 모드
    setEditMode: (mode: EditMode) => void;
    startPathDrawing: (type: PathType, fromPosition: Position, fromElementId?: string) => void;
    completePathDrawing: (toPosition: Position) => void;
    cancelPathDrawing: () => void;

    // 코멘트
    setComment: (comment: string) => void;

    // 전체 관리
    clear: () => void;
    applyAiResult: (result: AiGeneratedBoard) => void;

    // 삭제 모드에서 요소 탭
    handleElementTapInDeleteMode: (id: string) => void;
    handlePathTapInDeleteMode: (id: string) => void;
}

const initialState = {
    fieldType: "half" as FieldType,
    elements: [] as DrillElement[],
    paths: [] as DrillPath[],
    selectedElementId: null as string | null,
    selectedPathId: null as string | null,
    editMode: "select" as EditMode,
    pathDrawingState: null as PathDrawingState | null,
    comment: "",
    playerCounters: { teamA: 1, teamB: 1 },
};

// 스토어 생성 함수
const createEditorStore = (set: any, get: any): EditorState => ({
    ...initialState,

    setFieldType: (type) => set({ fieldType: type }),

    addElement: (type, position, team) => {
        const id = generateId();
        const state = get();
        let label: string | undefined;
        let color: string | undefined;
        const newCounters = { ...state.playerCounters };

        if (type === "player") {
            const playerTeam = team || "teamA";
            if (playerTeam === "teamA") {
                label = String(newCounters.teamA);
                newCounters.teamA++;
                color = ELEMENT_COLORS.teamA;
            } else {
                label = String(newCounters.teamB);
                newCounters.teamB++;
                color = ELEMENT_COLORS.teamB;
            }
        } else if (type === "cone") {
            color = ELEMENT_COLORS.cone;
        } else if (type === "ball") {
            color = ELEMENT_COLORS.ball;
        } else if (type === "goal") {
            color = ELEMENT_COLORS.goal;
        } else if (type === "pole") {
            color = ELEMENT_COLORS.pole;
        }

        const newElement: DrillElement = {
            id,
            type,
            position,
            label,
            color,
            team: type === "player" ? (team || "teamA") : undefined,
        };

        set({
            elements: [...state.elements, newElement],
            playerCounters: newCounters,
        });

        return id;
    },

    updateElementPosition: (id, position) => {
        set((state: EditorState) => ({
            elements: state.elements.map((el) =>
                el.id === id ? { ...el, position } : el
            ),
        }));
    },

    removeElement: (id) => {
        set((state: EditorState) => ({
            elements: state.elements.filter((el) => el.id !== id),
            selectedElementId:
                state.selectedElementId === id ? null : state.selectedElementId,
        }));
    },

    addPath: (type, from, to) => {
        const id = generateId();
        const newPath: DrillPath = {
            id,
            type,
            from,
            to,
        };

        set((state: EditorState) => ({
            paths: [...state.paths, newPath],
        }));

        return id;
    },

    removePath: (id) => {
        set((state: EditorState) => ({
            paths: state.paths.filter((p) => p.id !== id),
            selectedPathId:
                state.selectedPathId === id ? null : state.selectedPathId,
        }));
    },

    selectElement: (id) => {
        set({ selectedElementId: id, selectedPathId: null });
    },

    selectPath: (id) => {
        set({ selectedPathId: id, selectedElementId: null });
    },

    clearSelection: () => {
        set({ selectedElementId: null, selectedPathId: null });
    },

    setEditMode: (mode) => {
        set({
            editMode: mode,
            pathDrawingState: null,
            selectedElementId: null,
            selectedPathId: null,
        });
    },

    startPathDrawing: (type, fromPosition, fromElementId) => {
        set({
            pathDrawingState: {
                type,
                fromPosition,
                fromElementId,
            },
        });
    },

    completePathDrawing: (toPosition) => {
        const state = get();
        if (!state.pathDrawingState) return;

        const { type, fromPosition } = state.pathDrawingState;
        const id = generateId();
        const newPath: DrillPath = {
            id,
            type,
            from: fromPosition,
            to: toPosition,
        };

        set({
            paths: [...state.paths, newPath],
            pathDrawingState: null,
        });
    },

    cancelPathDrawing: () => {
        set({ pathDrawingState: null });
    },

    setComment: (comment) => set({ comment }),

    clear: () => {
        set({
            ...initialState,
            fieldType: get().fieldType,
        });
    },

    applyAiResult: (result) => {
        set({
            elements: result.elements,
            paths: result.paths,
            comment: result.comment,
            selectedElementId: null,
            selectedPathId: null,
            pathDrawingState: null,
            editMode: "select",
            playerCounters: {
                teamA: Math.max(
                    1,
                    ...result.elements
                        .filter((e) => e.team === "teamA" && e.label)
                        .map((e) => parseInt(e.label || "0") + 1)
                ),
                teamB: Math.max(
                    1,
                    ...result.elements
                        .filter((e) => e.team === "teamB" && e.label)
                        .map((e) => parseInt(e.label || "0") + 1)
                ),
            },
        });
    },

    handleElementTapInDeleteMode: (id) => {
        const state = get();
        if (state.editMode === "delete") {
            state.removeElement(id);
        }
    },

    handlePathTapInDeleteMode: (id) => {
        const state = get();
        if (state.editMode === "delete") {
            state.removePath(id);
        }
    },
});

// 웹에서는 persist 없이, 네이티브에서만 persist 사용
// 현재는 웹 개발 중이므로 persist 없이 사용
export const useEditorStore = create<EditorState>()(createEditorStore);
