/**
 * Domain Save entity — represents a text highlight saved by a user.
 * Pure TypeScript, no ORM decorators.
 */
export type SaveCategory = 'Vocabulary' | 'Phrase' | 'Grammar' | 'Idiom' | 'Pronunciation';

export class SaveEntity {
  id: string;
  userId: string;
  text: string; // the highlighted text
  sentence: string | null; // full sentence context
  paragraph: string | null; // paragraph context
  sourceUrl: string | null;
  sourceTitle: string | null;
  category: SaveCategory | null;
  createdAt: Date;
  updatedAt: Date;
}
