export interface TechnicalUnderstanding {
  why: string;
  problem: string;
  analogy: string;
  mechanism: string;
  trigger: string;
  without: string;
}
export interface StockIdea {
  id: number;
  details: string;
  technicalUnderstanding: string;
  unknownWords: string; // JSON文字列
  relatedLinks: string; // JSON文字列
  ownWords: string;
  metaphor: string;
  categories: string; // JSON文字列
  isUsed: boolean;
  draftUrl: string;
  createdAt: string;
  updatedAt: string;
}
export interface RelatedLink {
  memo: string;
  url: string;
  title: string;
}
