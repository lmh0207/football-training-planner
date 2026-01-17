// 훈련 블록 유형
export type BlockType = 'warmup' | 'main' | 'game' | 'cooldown';

// 훈련 강도
export type Intensity = 'low' | 'medium' | 'high';

// 경기장 유형
export type FieldType = 'futsal' | 'half' | 'full';

// 팀 레벨
export type TeamLevel = 'beginner' | 'amateur' | 'pro';

// 훈련 목표
export type TrainingGoal =
  | 'passing'      // 패스
  | 'shooting'     // 슈팅
  | 'defense'      // 수비
  | 'possession'   // 점유율
  | 'pressing'     // 압박
  | 'transition'   // 전환
  | 'fitness'      // 체력
  | 'teamwork';    // 팀워크

// 훈련 블록 (개별 훈련 항목)
export interface TrainingBlock {
  id: string;
  type: BlockType;
  title: string;
  duration: number;           // 분 단위
  description?: string;
  coachingPoints?: string[];  // 코칭 포인트
  equipment?: string[];       // 필요 장비
  playerCount?: {
    min: number;
    max: number;
  };
  intensity: Intensity;
  memo?: string;              // 사용자 메모
}

// 훈련 조건
export interface TrainingConditions {
  playerCount: number;
  totalDuration: number;      // 총 훈련 시간 (분)
  fieldType: FieldType;
  teamLevel: TeamLevel;
  goals: TrainingGoal[];
  hasGoalkeeper: boolean;
  hasInjuredPlayers: boolean;
}

// 훈련 세션 (전체 훈련)
export interface TrainingSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;

  // 훈련 조건
  conditions: TrainingConditions;

  // 훈련 블록들
  blocks: TrainingBlock[];

  // AI 관련
  isAiGenerated: boolean;
  aiExplanation?: string;     // AI 설계 이유

  // 메타
  isFavorite: boolean;
  tags?: string[];
}

// 블록 유형 라벨
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  warmup: '워밍업',
  main: '메인 훈련',
  game: '게임',
  cooldown: '쿨다운',
};

// 강도 라벨
export const INTENSITY_LABELS: Record<Intensity, string> = {
  low: '낮음',
  medium: '보통',
  high: '높음',
};

// 경기장 라벨
export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  futsal: '풋살장',
  half: '하프 코트',
  full: '풀 코트',
};

// 팀 레벨 라벨
export const TEAM_LEVEL_LABELS: Record<TeamLevel, string> = {
  beginner: '초보',
  amateur: '동호회',
  pro: '선출/프로',
};

// 훈련 목표 라벨
export const TRAINING_GOAL_LABELS: Record<TrainingGoal, string> = {
  passing: '패스',
  shooting: '슈팅',
  defense: '수비',
  possession: '점유율',
  pressing: '압박',
  transition: '전환',
  fitness: '체력',
  teamwork: '팀워크',
};
