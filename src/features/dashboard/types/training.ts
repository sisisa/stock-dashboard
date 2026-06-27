import type { QuestionAnswers } from "./common";

export const FrameWorksTabs = [
  { id: "understanding", label: "理解フレームワーク" },
  { id: "training", label: "思考トレーニング" },
  { id: "structuring", label: "構造化トレーニング" },
] as const;

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

export const defaultTechnicalUnderstanding: TechnicalUnderstanding = {
  why: "",
  problem: "",
  mechanism: "",
  trigger: "",
  without: "",
  demerit: "",
  situation: "",
  analogy: "",
  difference: "",
};

export interface StructuringItem {
  Purpose: Purpose;
  Piece: string[];
}

export interface Purpose {
  /** 誰が */
  who: string;

  /** いつ */
  when: string;

  /** 誰と */
  whom: string;

  /** 何をするために */
  what: string;
}

// 構造化トレーニングの空データ
export const defaultStructuringItem: StructuringItem = {
  Purpose: {
    who: "",
    when: "",
    whom: "",
    what: "",
  },

  Piece: [""],
};

//StructuringSection から除外する値
export type FixedSection = "Purpose";

export const sections = [
  {
    key: "Purpose",
    title: "Purpose",
    description: "目的を整理する",
    type: "fixed",

    fields: [
      {
        field: "who",
        label: "誰が？",
      },
      {
        field: "when",
        label: "いつ？",
      },
      {
        field: "whom",
        label: "誰と？",
      },
      {
        field: "what",
        label: "何をするために？",
      },
    ],
  },

  {
    key: "Piece",
    title: "Piece",
    description: "構造化のための断片を書き出す",
    type: "dynamic",
  },
] as const;

export interface FiveW1H {
  when: string;
  where: string;
  what: string;
  who: string;
  why: string;
  how: string;
}

export interface FourPointSummary {
  a: string;
  b: string;
  c: string;
  common: string;
}

export interface Commonalities {
  targetA: string;
  targetB: string;
  points: string[];
  structure: string;
}

export interface LogicCheck {
  conclusion: string;
  reason: string;
  example: string;
  meaning: string;
}

export interface Analogy {
  summary: string;
  analogy: string;
  reason: string;
}

export interface ThinkingTraining {
  theme: string;
  issue: string;
  exclusion: string;

  fiveW1H: FiveW1H;

  otherPerspective: FourPointSummary;

  ownOpinion: FourPointSummary;

  whySo: QuestionAnswers;

  soWhat: QuestionAnswers;

  goodLineLog: string;

  commonalities: Commonalities;

  concreteToAbstract: {
    concrete: string;
    abstract: string;
  };

  abstractToConcrete: {
    concrete: string;
    abstract: string;
  };

  analogy: Analogy;

  logicCheck: LogicCheck;

  oneSentence: string;

  discovery: string;
}

/**
 * 思考トレーニングモードの初期値
 *
 * 新規登録時や登録完了後に利用する。
 * 「空の思考トレーニングシート」
 * のテンプレートとして扱う。
 */

export const defaultThinkingTrainingData: ThinkingTraining = {
  theme: "",
  issue: "",
  exclusion: "",
  fiveW1H: { when: "", where: "", what: "", who: "", why: "", how: "" },
  otherPerspective: { a: "", b: "", c: "", common: "" },
  ownOpinion: { a: "", b: "", c: "", common: "" },
  whySo: { question: "", answers: ["", "", "", "", ""] },
  soWhat: { question: "", answers: ["", "", "", "", ""] },
  goodLineLog: "",
  commonalities: { targetA: "", targetB: "", points: [], structure: "" },
  concreteToAbstract: { concrete: "", abstract: "" },
  abstractToConcrete: { concrete: "", abstract: "" },
  analogy: { summary: "", analogy: "", reason: "" },
  logicCheck: { conclusion: "", reason: "", example: "", meaning: "" },
  oneSentence: "",
  discovery: "",
};
