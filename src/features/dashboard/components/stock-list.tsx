"use client";

import { StockIdea } from "../types";

interface StockListProps {
  ideas: StockIdea[];
  isLoading: boolean;
}

export function StockList({ ideas, isLoading }: StockListProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-white/50">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-5">
      <h2 className="mb-4 text-xl font-bold">確認・検索</h2>

      <div className="mb-4 flex gap-2">
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
        {ideas.length === 0 ? (
          <p className="text-sm text-white/50">データがありません。</p>
        ) : (
          ideas.map((idea) => (
            <div
              key={idea.id}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:border-blue-500/50 hover:bg-white/10"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                  カテゴリ
                </span>
                <span className="text-xs text-white/40">
                  {new Date(idea.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="line-clamp-2 text-sm font-medium">
                {idea.details || "詳細なし"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
