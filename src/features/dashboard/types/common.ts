// モード
// export type ActiveMode = "understanding" | "training";

export const activeModes = [
  {
    value: "understanding",
    label: "理解フレームワーク",
  },
  {
    value: "training",
    label: "思考トレーニング",
  },
  {
    value: "structuring",
    label: "構造化トレーニング",
  },
] as const;

export type ActiveMode = (typeof activeModes)[number]["value"];
// リンク
export interface LinkItem {
  title: string;
  url: string;
  memo: string;
}

// 不明単語
export interface UnknownWord {
  word: string;
  result: string;
}

// 共通質問
export interface QuestionAnswers {
  question: string;
  answers: string[];
}
