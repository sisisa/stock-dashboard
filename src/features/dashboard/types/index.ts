export interface TechnicalUnderstanding {
  why: string;
  problem: string;
  analogy: string;
  mechanism: string;
  trigger: string;
  without: string;
}

export interface UnknownWord {
  word: string;
  result: string;
}

export interface RelatedLink {
  memo: string;
  url: string;
  title: string;
}

export interface StockIdea {
  id: number;
  details: string;
  technicalUnderstanding: string; // JSON文字列
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

// 登録用に自動生成項目を除外した型
export type StockIdeaInput = Omit<
  StockIdea,
  "id" | "isUsed" | "draftUrl" | "createdAt" | "updatedAt"
>;
