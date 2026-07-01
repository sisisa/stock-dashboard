import type {
  TechnicalUnderstanding,
  StructuringItem,
  ThinkingTraining,
} from "./training";

import type { UnknownWord, LinkItem, ActiveMode } from "./common";

export interface DraftData {
  details?: string;

  technicalUnderstanding?: TechnicalUnderstanding;

  structuringItem?: StructuringItem;

  thinkingTraining: ThinkingTraining;

  activeMode: ActiveMode;

  unknownWords?: UnknownWord[];

  links?: LinkItem[];

  ownWords?: string;

  metaphor?: string;

  categories?: string[];
}

export interface StockIdea {
  id: number;

  details: string;

  technicalUnderstanding: string;

  structuringItem: string;

  thinkingTraining: string;

  activeMode: ActiveMode;

  unknownWords: string;

  relatedLinks: string;

  ownWords: string;

  metaphor: string;

  categories: string;

  isUsed: boolean;

  draftUrl: string;

  createdAt: string;

  updatedAt: string;
}

export interface ParsedStockIdea extends StockIdea {
  parsedTechnicalUnderstanding: TechnicalUnderstanding;

  parsedStructuringItem: StructuringItem;

  parsedThinkingTraining: ThinkingTraining;

  parsedUnknownWords: UnknownWord[];

  parsedRelatedLinks: LinkItem[];

  parsedCategories: string[];
}

// 登録用に自動生成項目を除外した型
export type StockIdeaInput = Omit<
  StockIdea,
  "id" | "isUsed" | "draftUrl" | "createdAt" | "updatedAt"
>;
