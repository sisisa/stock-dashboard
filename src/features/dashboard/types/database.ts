import type {
  TechnicalUnderstanding,
  StructuringItem,
  ThinkingTraining,
} from "./training";

import type { UnknownWord, LinkItem } from "./common";

export interface DraftData {
  details?: string;

  technicalUnderstanding?: TechnicalUnderstanding;

  structuringItem?: StructuringItem;

  thinkingTraining: ThinkingTraining;

  activeMode: string;

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

  structuringItem?: string;

  thinkingTraining: string;

  activeMode: string;

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
