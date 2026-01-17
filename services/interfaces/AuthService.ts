import { User } from '@/types';

export interface AuthService {
  // 현재 사용자 가져오기
  getCurrentUser(): Promise<User | null>;

  // 이메일 로그인
  signInWithEmail(email: string, password: string): Promise<User>;

  // 이메일 회원가입
  signUpWithEmail(email: string, password: string, displayName?: string): Promise<User>;

  // 구글 로그인
  signInWithGoogle(): Promise<User>;

  // 애플 로그인
  signInWithApple(): Promise<User>;

  // 로그아웃
  signOut(): Promise<void>;

  // 사용자 정보 업데이트
  updateUser(updates: Partial<User>): Promise<User>;

  // 인증 상태 변경 리스너
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
