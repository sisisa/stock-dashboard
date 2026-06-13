export interface TechnicalUnderstanding {
  why: string;
  problem: string;
  analogy: string;
  mechanism: string;
  trigger: string;
  without: string;
  demerit: string;
  situation: string;
  difference: string;
}

// 思考トレーニング用の型定義（テンプレートに完全準拠）
export interface ThinkingTraining {
  theme: string;
  issue: string;
  exclusion: string;
  fiveW1H: {
    when: string;
    where: string;
    what: string;
    who: string;
    why: string;
    how: string;
  };
  otherPerspective: { a: string; b: string; c: string; common: string };
  ownOpinion: { op1: string; op2: string; op3: string; common: string };
  whySo: { question: string; answers: string[] }; // 5つの問い
  soWhat: { question: string; answers: string[] }; // 5つの問い
  goodLineLog: string;
  commonalities: {
    targetA: string;
    targetB: string;
    points: string[];
    structure: string;
  }; // 10個のポイント
  concreteToAbstract: { concrete: string; abstract: string };
  abstractToConcrete: { concrete: string; abstract: string };
  analogy: { summary: string; analogy: string; reason: string };
  logicCheck: {
    conclusion: string;
    reason: string;
    example: string;
    meaning: string;
  };
  oneSentence: string;
  discovery: string;
}

export interface UnknownWord {
  word: string;
  result: string;
}

export interface DraftData {
  details?: string;
  technicalUnderstanding?: TechnicalUnderstanding; // 追加
  thinkingTraining: ThinkingTraining; // M列 (思考トレーニングモード) ※新規
  activeMode: string; // N列 ("understanding" or "training") ※新規
  unknownWords?: UnknownWord[];
  links?: LinkItem[];
  ownWords?: string;
  metaphor?: string;
  categories?: string[];
}

export interface LinkItem {
  memo: string;
  url: string;
  title: string;
}
export interface RelatedLink {
  memo: string;
  url: string;
  title: string;
}

export interface StockIdea {
  id: number;
  details: string;
  technicalUnderstanding: string; // L列 (理解モード)
  thinkingTraining: string; // M列 (思考トレーニングモード) ※新規
  activeMode: string; // N列 ("understanding" or "training") ※新規
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

export type ParsedStockIdea = StockIdea & {
  parsedTechnicalUnderstanding: TechnicalUnderstanding;
  parsedCategories: string[];
  parsedUnknownWords: { word: string; result: string }[];
  parsedRelatedLinks: { memo: string; url: string; title: string }[];
};

export interface IdeaDetailModalProps {
  idea: StockIdea;
  onClose: () => void;
}

export interface StockFormProps {
  onComplete: () => void;
}
