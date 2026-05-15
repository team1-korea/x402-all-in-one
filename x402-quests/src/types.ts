export type QuestType =
  | 'drag-drop'
  | 'theory-ox'
  | 'theory-mc'
  | 'snowman-sabotage'
  | 'staff-code'
  | 'feedback'
  | 'threejs'
  | 'interests';

export interface QuestQuestion {
  question: string;
  choices: string[];
}

export interface QuestData {
  questType: QuestType;
  step: number;
  productId: string;
  walletAddress: string;
  name: string;
  description: string;
  // theory quests
  theory?: string;
  questions?: QuestQuestion[];
}

export interface AnswerResult {
  correct: boolean;
  message: string;
}
