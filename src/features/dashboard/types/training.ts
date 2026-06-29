import type { QuestionAnswers } from "./common";

export const FrameWorksTabs = [
  { id: "understanding", label: "理解フレームワーク" },
  { id: "training", label: "思考トレーニング" },
  { id: "structuring", label: "構造化トレーニング" },
] as const;

/*** 理解フレームワーク関連***/
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

/*** 構造化トレーニング関連***/
export interface StructuringItem {
  Purpose: Purpose;
  Piece: string[];
  Perspective: string[];
  Pillar: string[];
  Presentation: string[];
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

  Perspective: [""],

  Pillar: [""],

  Presentation: [""],

  // Perspective(視点) →書き出した断片をどのような視点で整理するかを考える ※この部分が一番難易度が高く、重要である
  // Pillar(支柱) →上記の視点で決めた後、その構造をどのくらいの大きさの支柱で揃えるかを考える。
  // Presentation(表現) →ここまで考えてきた内容をどのような構造で表現するかを決める
};

// 配列で管理する構造化セクション
export type DynamicStructuringSection =
  | "Piece"
  | "Perspective"
  | "Pillar"
  | "Presentation";

export interface FixedSection {
  key: "Purpose";

  title: string;

  description: string;

  type: "fixed";

  fields: {
    field: keyof Purpose;
    label: string;
  }[];
}

export interface DynamicSection {
  key: DynamicStructuringSection;

  title: string;

  description: string;

  type: "dynamic";

  placeholder: string;
}

export type StructuringSection = FixedSection | DynamicSection;

export const sections: StructuringSection[] = [
  {
    key: "Purpose",
    title: "Purpose",
    description: "対象となる問題の目的を整理する",
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
    description: "構造化するための断片を書き出す",
    type: "dynamic",
    placeholder: "断片を書き出す",
  },

  {
    key: "Perspective",
    title: "Perspective",
    description: "どの視点で整理すると分かりやすいかを書く",
    type: "dynamic",
    placeholder: "例：時間・場所・人物・原因・結果",
  },

  {
    key: "Pillar",
    title: "Pillar",
    description: "Perspectiveで決めた視点を、どの粒度で揃えるかを書く",
    type: "dynamic",
    placeholder: "例：3分類・5分類・大中小",
  },

  {
    key: "Presentation",
    title: "Presentation",
    description: "最終的にどの構造で表現するかを書く",
    type: "dynamic",
    placeholder: "例：表・ツリー・マインドマップ",
  },
] as const;

/*** 思考トレーニング(言語化トレーニング)関連***/
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
