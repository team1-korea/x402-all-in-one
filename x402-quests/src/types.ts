export type QuestType =
  | 'drag-drop'
  | 'theory-ox'
  | 'theory-mc'
  | 'find-click'
  | 'staff-code'
  | 'feedback'
  | 'threejs'
  | 'interests';

export interface QuestData {
  questType: QuestType;
  step: number;
  productId: string;
  walletAddress: string;
  name: string;
  description: string;
  // theory quests
  theory?: string;
  question?: string;
  choices?: string[];
}

export interface AnswerResult {
  correct: boolean;
  message: string;
}
