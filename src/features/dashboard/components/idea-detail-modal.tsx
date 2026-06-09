"use client";

import { useMemo } from "react";
import { StockIdea } from "@/lib/gas-api";

interface IdeaDetailModalProps {
  idea: StockIdea;
  onClose: () => void;
}

/**
 * 外部から渡されるJSON文字列を安全にパースするためのヘルパー
 * 理由: GAS等の外部データは型が完全に保証されないため、手動で不正な文字が入った際の
 *       JSON.parse エラーによる画面（UI）全体のクラッシュを防ぐための防波堤として設置。
 */
function safeParse<T>(value: string, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("JSON parse error:", error);
    return fallback;
  }
}

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

          {/* 明確にわからない単語と調査結果 */}
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold text-white">
              明確にわからない単語と調査した結果
            </h4>
            {unknownWords.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {unknownWords.map((item, index) => (
                  <li key={index} className="rounded bg-white/5 p-3">
                    <span className="font-bold text-white/90">{item.word}</span>
                    <span className="mx-2 text-white/40">-</span>
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
                      className="font-bold text-blue-400 hover:underline"
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
    </div>
  );
}
