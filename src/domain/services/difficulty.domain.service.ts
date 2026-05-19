import { UserLevel } from '../entities/user.entity';

/**
 * Domain service: Level adaptation rules.
 * Rules:
 *   - Nudge UP after 5 consecutive days with accuracy >= 90%
 *   - Nudge DOWN after accuracy drops below 50%
 * No NestJS, no DB, no HTTP — pure business logic.
 */
const LEVEL_ORDER: UserLevel[] = ['A2', 'B1', 'B2', 'C1'];

export class DifficultyDomainService {
  /**
   * Suggest a new level based on recent accuracy.
   * Returns null if no change is warranted.
   */
  suggestLevel(
    currentLevel: UserLevel,
    recentAccuracy: number,
    daysAbove90: number,
  ): UserLevel | null {
    const idx = LEVEL_ORDER.indexOf(currentLevel);

    // Nudge up: 5+ days with >= 90% accuracy and there is a higher level
    if (daysAbove90 >= 5 && recentAccuracy >= 0.9 && idx < LEVEL_ORDER.length - 1) {
      return LEVEL_ORDER[idx + 1];
    }

    // Nudge down: accuracy below 50% and there is a lower level
    if (recentAccuracy < 0.5 && idx > 0) {
      return LEVEL_ORDER[idx - 1];
    }

    return null;
  }

  nextLevel(current: UserLevel): UserLevel | null {
    const idx = LEVEL_ORDER.indexOf(current);
    return idx < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[idx + 1] : null;
  }

  prevLevel(current: UserLevel): UserLevel | null {
    const idx = LEVEL_ORDER.indexOf(current);
    return idx > 0 ? LEVEL_ORDER[idx - 1] : null;
  }
}
