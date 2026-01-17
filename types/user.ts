import { TeamLevel } from './training';

// 구독 플랜
export type SubscriptionPlan = 'free' | 'premium';

// 사용자 정보
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  createdAt: Date;

  // 구독 정보
  subscription: SubscriptionPlan;
  aiUsageCount: number;        // AI 사용 횟수
  aiUsageResetAt?: Date;       // AI 사용량 리셋 시점

  // 기본 팀 정보
  teamInfo?: {
    name: string;
    level: TeamLevel;
    defaultPlayerCount: number;
  };
}

// 무료 플랜 AI 사용 제한
export const FREE_AI_USAGE_LIMIT = 5;
