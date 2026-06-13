"use client";

import { useMemo } from "react";
import {
  TechnicalUnderstanding,
  IdeaDetailModalProps,
  ThinkingTraining,
} from "../types";

import { safeParse } from "../utils/parse";

export default function IdeaDetailModal({
  idea,
  onClose,
}: IdeaDetailModalProps) {
  // モーダルの背景クリックで閉じる処理
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const techData = useMemo(
    () =>
      safeParse<TechnicalUnderstanding>(
        idea.technicalUnderstanding,
        {} as TechnicalUnderstanding,
      ),
    [idea.technicalUnderstanding],
  );
  const trainingData = useMemo(
    () =>
      safeParse<ThinkingTraining>(
        idea.thinkingTraining,
        {} as ThinkingTraining,
      ),
    [idea.thinkingTraining],
  );

  // 空欄の項目はレンダリングしないためのヘルパー関数
  const renderField = (
    label: string,
    value: string | undefined,
    colorClass: string = "text-blue-400",
  ) => {
    if (!value || value.trim() === "") return null;
    return (
      <div className="mb-2 flex flex-col">
        <span className={`font-bold ${colorClass}`}>{label}</span>
        <span className="whitespace-pre-wrap text-white">{value}</span>
      </div>
    );
  };

  // 毎回レンダリング時にパースし直さないようメモ化
  // 理由: パース処理は比較的重いため、ideaの内容が変わらない限り再計算を避ける
  const unknownWords = useMemo(
    () => safeParse<{ word: string; result: string }[]>(idea.unknownWords, []),
    [idea.unknownWords],
  );
  const relatedLinks = useMemo(
    () =>
      safeParse<{ memo: string; url: string; title: string }[]>(
        idea.relatedLinks,
        [],
      ),
    [idea.relatedLinks],
  );
  const categories = useMemo(
    () => safeParse<string[]>(idea.categories, []),
    [idea.categories],
  );

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      {/* 
        理由: ダイアログのサイズを大きくするため、max-w-2xl から max-w-4xl に変更。
        また、高さを max-h-full とし、内部で overflow-y-auto を指定することで、
        情報量が多くなっても画面からはみ出さずスクロールできるようにしている。
      */}
      <div className="custom-scrollbar flex max-h-full w-full max-w-4xl flex-col gap-6 overflow-y-auto rounded-2xl border border-white/10 bg-[#121214] p-6 shadow-2xl">
        {/* ヘッダー部分 */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-white/90">詳細情報の確認</h3>
            {/* カテゴリ表示 */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                  <span
                    key={i}
                    className="rounded bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-300"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ部分 */}
        <div className="flex flex-col gap-6 text-sm text-white/80">
          {/* 詳細の記載 */}
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-white">詳細の記載</h4>
            <p className="rounded bg-white/5 p-4 whitespace-pre-wrap">
              {idea.details || "未記載"}
            </p>
          </div>

          {/* モードに応じた表示切り替え */}
          {idea.activeMode === "training" ? (
            <div className="flex flex-col gap-2 rounded border border-white/10 bg-[#121214] p-4">
              <h3 className="mb-2 text-sm font-bold text-purple-400">
                思考トレーニング
              </h3>
              {renderField("テーマ", trainingData?.theme)}
              {renderField("論点", trainingData?.issue)}
              {renderField("今回は考えないこと", trainingData?.exclusion)}
              {renderField(
                "一文の結論",
                trainingData?.oneSentence,
                "text-red-400",
              )}
              {/* 必要な項目を適宜renderFieldで呼び出す */}
            </div>
          ) : (
            <div className="flex flex-col gap-2 rounded border border-white/10 bg-[#121214] p-4">
              <h3 className="mb-2 text-sm font-bold text-white">
                理解フレームワーク
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {renderField(
                  "Why (なぜ存在するのか？)",
                  techData?.why,
                  "text-white",
                )}
                {renderField(
                  "Problem (何を解決するのか？)",
                  techData?.problem,
                  "text-white",
                )}
                {renderField(
                  "Difference (他の類似概念との決定的な違いは？)",
                  techData?.difference,
                  "text-white",
                )}
                {renderField(
                  "Mechanism (内部で何が起きているのか？)",
                  techData?.mechanism,
                  "text-white",
                )}
                {renderField(
                  "Trigger (いつ動くのか？)",
                  techData?.trigger,
                  "text-white",
                )}
                {renderField(
                  "Without (無かったら何が困るのか？)",
                  techData?.without,
                  "text-white",
                )}
                {renderField(
                  "Demerit (デメリット・トレードオフ)",
                  techData?.demerit,
                  "text-white",
                )}
                {renderField(
                  "Situation (どんな場面で使うべきか？)",
                  techData?.situation,
                  "text-white",
                )}
                {renderField(
                  "Analogy (何に似ているのか？)",
                  techData?.analogy,
                  "text-white",
                )}
              </div>
            </div>
          )}
        </div>

        {/* 明確にわからない単語と調査結果 */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-white">
            明確にわからない単語と調査した結果
          </h4>
          {unknownWords.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {unknownWords.map((item, index) => (
                <li key={index} className="rounded bg-white/5 p-3">
                  <span className="font-bold text-white">{item.word}</span>
                  <span className="mx-2 text-white">：</span>
                  <span>{item.result}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/40">未記載</p>
          )}
        </div>

        {/* 関連リンク */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-white">関連リンク</h4>
          {relatedLinks.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {relatedLinks.map((link, index) => (
                <li
                  key={index}
                  className="flex flex-col gap-1 rounded bg-white/5 p-3"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-white hover:underline"
                  >
                    {link.title || link.url}
                  </a>
                  {link.memo && (
                    <p className="text-xs text-white">{link.memo}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/40">未記載</p>
          )}
        </div>

        {/* 自分の言葉で整理 */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-white">自分の言葉で整理</h4>
          <p className="rounded bg-white/5 p-4 whitespace-pre-wrap">
            {idea.ownWords || "未記載"}
          </p>
        </div>

        {/* たとえを考える */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-white">たとえ</h4>
          <p className="rounded bg-white/5 p-4 whitespace-pre-wrap">
            {idea.metaphor || "未記載"}
          </p>
        </div>
      </div>
    </div>
  );
}
