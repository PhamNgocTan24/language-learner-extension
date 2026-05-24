/**
 * Domain User entity — pure TypeScript, no ORM decorators.
 * ORM mapping lives in infrastructure/repositories.
 */
export type UserLevel = 'A2' | 'B1' | 'B2' | 'C1';
export type UserTier = 'free' | 'pro' | 'lifetime';
export type UserGoal = 'read_news' | 'work' | 'ielts' | string;
export type NativeLanguage = 'Vietnamese' | 'Indonesian' | 'Thai' | 'Other' | string;

export class UserEntity {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  level: UserLevel;
  goal: UserGoal | null;
  nativeLanguage: NativeLanguage;
  tier: UserTier;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
