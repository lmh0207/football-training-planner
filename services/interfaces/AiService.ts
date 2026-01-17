import { TrainingConditions, TrainingSession, AiAdvice } from '@/types';

export interface AiService {
  // AI로 훈련 세션 생성
  generateSession(conditions: TrainingConditions): Promise<{
    session: Omit<TrainingSession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
    explanation: string;
  }>;

  // 현재 세션에 대한 AI 조언 받기
  getAdvice(session: TrainingSession): Promise<AiAdvice[]>;

  // 세션 구성 이유 설명 받기
  getExplanation(session: TrainingSession): Promise<string>;
}
