/**
 * Domain service: Free tier save limit rule.
 * Rule: free tier users may save at most 20 items per calendar month.
 * No NestJS, no DB, no HTTP — pure business logic.
 */
export const FREE_TIER_MONTHLY_LIMIT = 20;

export class SaveLimitDomainService {
  /**
   * Returns true if the user is allowed to create another save.
   * @param tier      user's subscription tier
   * @param saveCount number of saves the user has made this month
   */
  canSave(tier: string, saveCount: number): boolean {
    if (tier === 'pro' || tier === 'lifetime') return true;
    return saveCount < FREE_TIER_MONTHLY_LIMIT;
  }

  remainingSaves(tier: string, saveCount: number): number | null {
    if (tier === 'pro' || tier === 'lifetime') return null; // unlimited
    return Math.max(0, FREE_TIER_MONTHLY_LIMIT - saveCount);
  }
}
