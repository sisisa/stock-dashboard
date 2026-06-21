// モード
export type ActiveMode = "understanding" | "training";

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
