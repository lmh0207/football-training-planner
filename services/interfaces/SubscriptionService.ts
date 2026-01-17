import { SubscriptionPlan } from '@/types';

export interface SubscriptionService {
  // 현재 구독 플랜 조회
  getCurrentPlan(): Promise<SubscriptionPlan>;

  // AI 사용 횟수 조회
  getAiUsageCount(): Promise<number>;

  // AI 사용 가능 여부 확인
  canUseAi(): Promise<boolean>;

  // AI 사용 횟수 증가
  incrementAiUsage(): Promise<void>;

  // AI 사용 횟수 리셋 (월간)
  resetAiUsage(): Promise<void>;
}
