"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import IdeaDetailModal from "./idea-detail-modal";
import { useSearch } from "../hooks/use-search";

export default function SearchPanel() {
  // すべてのロジックをカスタムフックから呼び出す
  const { state, setters, handlers } = useSearch();

  return (
    <div className="relative flex h-full flex-col gap-4 rounded-xl border border-black/10 bg-white/5 p-5">
      <div className="flex gap-4 border-black">
        <h1 className="text-xl font-bold text-black">確認・検索</h1>
        <Button
          onClick={handlers.handleDownloadMarkdown}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          マークダウンダウンロード
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="キーワード検索..."
          value={state.searchTerm}
          onChange={(e) => setters.setSearchTerm(e.target.value)}
          className="w-full rounded border border-black bg-[#ffffff] p-2 text-black"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Combobox
            value={state.selectedCategory}
            onChange={setters.setSelectedCategory}
            options={state.availableCategories}
            placeholder="カテゴリを検索..."
          />
          <div className="flex items-center gap-2">
            <DatePicker
              value={state.startDate}
              onChange={setters.setStartDate}
              placeholder="開始日"
            />
            <span className="text-black">〜</span>
            <DatePicker
              value={state.endDate}
              onChange={setters.setEndDate}
              placeholder="終了日"
            />
          </div>
        </div>
      </div>

      {state.isLoading ? (
        <div className="flex h-full items-center justify-center p-5">
          <p className="text-black">読み込み中...</p>
        </div>
      ) : state.error ? (
        <div className="flex h-full items-center justify-center p-5">
          <p className="text-red-500">{state.error}</p>
        </div>
      ) : state.filteredIdeas.length === 0 ? (
        <div className="flex h-full items-center justify-center p-5">
          <p className="text-black">該当するアイデアがありません。</p>
        </div>
      ) : (
        <div className="custom-scrollbar flex flex-col gap-3 overflow-y-auto">
          {state.filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              onClick={() => setters.setSelectedIdea(idea)}
              className="cursor-pointer rounded-lg border border-black/10 bg-white/5 p-4 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {idea.parsedCategories.length > 0 ? (
                    idea.parsedCategories.map((cat, i) => (
                      <span
                        key={i}
                        className="rounded bg-blue-500 px-2 py-1 font-semibold text-white"
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="rounded bg-white/10 px-2 py-1 font-semibold text-black">
                      未分類
                    </span>
                  )}
                </div>
                <span className="text-black">
                  {new Date(idea.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-black">
                {idea.details || "詳細なし"}
              </p>
            </div>
          ))}
        </div>
      )}

      {state.selectedIdea && (
        <IdeaDetailModal
          idea={state.selectedIdea}
          onClose={() => setters.setSelectedIdea(null)}
        />
      )}
    </div>
  );
}
