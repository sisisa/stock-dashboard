"use client";

import { useState } from "react";
import { StockIdea } from "@/lib/gas-api";
import IdeaDetailModal from "./idea-detail-modal";

export default function SearchPanel() {
  const [selectedIdea, setSelectedIdea] = useState<StockIdea | null>(null);

  // ※今回はUI確認のためのモックデータ配列を定義しています。
  // 実運用時は useEffect や useSWR等 で getStockIdeas() を呼び出してセットします。
  const mockIdeas: StockIdea[] = [
    {
      id: 1,
      details:
        "Next.jsとChrome拡張の連携におけるアーキテクチャの気づき。Backgroundスクリプトとストレージのやり取りが肝になる。",
      unknownWords: "[]",
      relatedLinks: "[]",
      ownWords:
        "つまり、Next.jsはUI描画に徹し、拡張のAPIは外から注入するイメージ。",
      metaphor: "レストランの厨房（Next.js）とウェイター（Chrome拡張）の関係。",
      categories: '["技術メモ", "Next.js"]',
      isUsed: false,
      draftUrl: "",
      createdAt: "2026-06-08T10:00:00Z",
      updatedAt: "2026-06-08T10:00:00Z",
    },
    {
      id: 2,
      details:
        "日常で感じた、タスク管理ツールの「入力の重さ」について。思いついた瞬間に書けないと意味がない。",
      unknownWords: "[]",
      relatedLinks: "[]",
      ownWords: "UIは限りなく透明に、すぐ書けることが正義。",
      metaphor: "すぐ出せるポケットサイズのメモ帳の重要性。",
      categories: '["日常系", "UI/UX"]',
      isUsed: false,
      draftUrl: "",
      createdAt: "2026-06-07T15:30:00Z",
      updatedAt: "2026-06-07T15:30:00Z",
    },
  ];

  return (
    <div className="relative flex h-full flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-xl font-bold">確認・検索</h2>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="キーワード検索..."
          className="flex-1 rounded-lg border border-white bg-black/40 p-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <input
          type="date"
          className="rounded-lg border border-white bg-black/40 p-2 text-sm text-white/80 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="custom-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto">
        {mockIdeas.map((idea) => (
          <div
            key={idea.id}
            onClick={() => setSelectedIdea(idea)}
            className="flex cursor-pointer flex-col rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-blue-500/50 hover:bg-white/10"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                {idea.categories !== "[]" ? "カテゴリあり" : "未分類"}
              </span>
              <span className="text-xs text-white/40">
                {new Date(idea.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <p className="line-clamp-2 text-sm font-medium text-white/90">
              {idea.details}
            </p>
          </div>
        ))}
      </div>

      {/* モーダルの呼び出し */}
      {selectedIdea && (
        <IdeaDetailModal
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
        />
      )}
    </div>
  );
}
