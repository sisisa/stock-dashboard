"use client";

import { StockIdea } from "@/lib/gas-api";

interface IdeaDetailModalProps {
  idea: StockIdea;
  onClose: () => void;
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

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="custom-scrollbar flex max-h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-2xl border border-white/10 bg-[#121214] p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg font-bold text-white/90">詳細情報の確認</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/40">
              詳細の記載
            </span>
            <p className="text-sm text-white/80">{idea.details || "未入力"}</p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/40">
              自分の言葉で整理
            </span>
            <p className="text-sm text-white/80">{idea.ownWords || "未入力"}</p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/40">たとえ</span>
            <p className="text-sm text-white/80">{idea.metaphor || "未入力"}</p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/40">
              カテゴリ
            </span>
            <p className="text-sm text-white/80">
              {idea.categories !== "[]" ? idea.categories : "未分類"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
