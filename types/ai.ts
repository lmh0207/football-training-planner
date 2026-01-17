import { TrainingBlock, TrainingConditions, TrainingSession } from './training';

// AI 생성 요청
export interface AiGenerateRequest {
  conditions: TrainingConditions;
}

// AI 생성 응답
export interface AiGenerateResponse {
  session: Omit<TrainingSession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  explanation: string;
}

// AI 조언 유형
export type AiAdviceType = 'warning' | 'suggestion' | 'info';

// AI 조언
export interface AiAdvice {
  id: string;
  type: AiAdviceType;
  title: string;
  message: string;
  suggestedBlock?: TrainingBlock;  // 추천 훈련 (있을 경우)
}

// AI 조언 요청
export interface AiAdviceRequest {
  session: TrainingSession;
}

// AI 설명 요청
export interface AiExplanationRequest {
  session: TrainingSession;
}
