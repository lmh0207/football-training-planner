import { TrainingSession } from '@/types';

export interface SessionService {
  // 세션 생성
  createSession(session: Omit<TrainingSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrainingSession>;

  // 세션 조회
  getSession(id: string): Promise<TrainingSession | null>;

  // 사용자의 모든 세션 조회
  getUserSessions(userId: string): Promise<TrainingSession[]>;

  // 세션 업데이트
  updateSession(id: string, updates: Partial<TrainingSession>): Promise<TrainingSession>;

  // 세션 삭제
  deleteSession(id: string): Promise<void>;

  // 세션 복사
  duplicateSession(id: string): Promise<TrainingSession>;

  // 즐겨찾기 토글
  toggleFavorite(id: string): Promise<TrainingSession>;

  // 즐겨찾기 세션만 조회
  getFavoriteSessions(userId: string): Promise<TrainingSession[]>;
}
