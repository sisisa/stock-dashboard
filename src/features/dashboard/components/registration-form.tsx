"use client";

import { Button } from "@/components/ui/button";
import TechFrameworkForm from "./tech-framework-form";
import TrainingFrameworkForm from "./training-framework-form";
import StructuringForm from "./structuring-form";

import { useRegistration } from "../hooks/use-registration"; // ← 新しく作ったフックを読み込む

import { FrameWorksTabs } from "../types/training";
import { cn } from "@/lib/utils";

interface RegistrationFormProps {
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
}

export default function RegistrationForm({
  isRightPanelOpen = true,
  onToggleRightPanel,
}: RegistrationFormProps) {
  // フックからステートと操作関数をすべて受け取る
  const { state, setters, handlers } = useRegistration();

  return (
    <div className="custom-scrollbar flex h-full flex-col gap-5 overflow-y-auto rounded-xl border border-black bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-black">アイデア・メモの登録</h2>
        {onToggleRightPanel && (
          <Button
            onClick={onToggleRightPanel}
            className="bg-primary flex items-center gap-2 rounded px-3 py-1.5 font-semibold text-white transition-colors hover:bg-white hover:text-black"
          >
            {isRightPanelOpen
              ? "検索・確認パネルを隠す"
              : "検索・確認パネルを開く"}
          </Button>
        )}
      </div>

      {/* タブ切り替えUI */}
      <div className="flex gap-2 border-b pb-2">
        {FrameWorksTabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setters.setActiveTab(tab.id)}
            className={cn(
              "border-b-2 px-4 py-2 font-bold transition-all",
              state.activeTab === tab.id
                ? "bg-primary border-black text-white"
                : "border-black bg-white text-black hover:bg-white",
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* 詳細の記載 */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-black">詳細の記載</label>
        <textarea
          value={state.details}
          onChange={(e) => {
            setters.setDetails(e.target.value);
            handlers.saveToStorage({ details: e.target.value });
          }}
          placeholder="ここに詳細を記載します..."
          className="min-h-[100px] w-full rounded border border-black bg-[#ffffff] p-3 text-black focus:border-black focus:outline-none"
        />
      </div>

      {/* 各フレームワークの表示切り替え */}
      {state.activeTab === "understanding" && (
        <TechFrameworkForm
          data={state.techUnderstanding}
          onChange={handlers.handleTechUnderstandingChange}
        />
      )}

      {/* 思考トレーニング */}
      {state.activeTab === "training" && (
        <TrainingFrameworkForm
          data={state.thinkingTraining}
          onChange={setters.setThinkingTraining}
        />
      )}

      {/* 構造化 */}
      {state.activeTab === "structuring" && (
        <StructuringForm
          data={state.structuringItem}
          onChange={handlers.handleStructuringItemChange}
          onPieceChange={handlers.handlePieceChange}
        />
      )}

      {/* 明確にわからない単語と調査した結果 */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-black">
          明確にわからない単語と調査した結果
        </label>
        {state.unknownWords.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              placeholder="単語"
              value={item.word}
              onChange={(e) =>
                handlers.updateUnknownWord(index, "word", e.target.value)
              }
              className="w-1/3 rounded border border-black bg-[#ffffff] p-2 text-black focus:outline-none"
            />
            <input
              type="text"
              placeholder="調査結果"
              value={item.result}
              onChange={(e) =>
                handlers.updateUnknownWord(index, "result", e.target.value)
              }
              className="w-2/3 rounded border border-black bg-[#ffffff] p-2 text-black focus:outline-none"
            />
          </div>
        ))}
        <div className="flex justify-end">
          <Button
            onClick={handlers.addUnknownWord}
            className="rounded bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            追加
          </Button>
        </div>
      </div>

      {/* 関連リンク */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-black">
          関連リンク (課題対応コピペ対応)
        </label>
        <div className="flex flex-col gap-2 rounded border border-black bg-[#ffffff] p-3">
          <input
            type="text"
            placeholder="リンクのメモ"
            value={state.linkMemo}
            onChange={(e) => setters.setLinkMemo(e.target.value)}
            className="w-full rounded border border-black bg-white/5 p-2 text-black focus:outline-none"
          />
          <input
            type="url"
            placeholder="関連リンクURL (必須 / ここに特殊コピペの貼り付けも可)"
            value={state.linkUrl}
            onChange={(e) => setters.setLinkUrl(e.target.value)}
            onPaste={handlers.handleLinkPaste}
            className="w-full rounded border border-black bg-white/5 p-2 text-black focus:outline-none"
          />
          <input
            type="text"
            placeholder="リンクタイトル"
            value={state.linkTitle}
            onChange={(e) => setters.setLinkTitle(e.target.value)}
            className="w-full rounded border border-black bg-white/5 p-2 text-black focus:outline-none"
          />
          <div className="mt-1 flex justify-end">
            <Button
              onClick={handlers.handleAddLink}
              disabled={!state.linkUrl.trim()}
              className="rounded bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              追加
            </Button>
          </div>
        </div>

        {state.links.length > 0 && (
          <ul className="flex flex-col gap-2">
            {state.links.map((link, index) => (
              <li
                key={index}
                className="flex flex-col gap-1 rounded border border-black bg-white/5 p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col overflow-hidden">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black-400 truncate font-bold hover:underline"
                    >
                      {link.title || link.url}
                    </a>
                    {link.memo && (
                      <p className="mt-1 text-xs text-black">{link.memo}</p>
                    )}
                  </div>
                  <div className="ml-2 flex shrink-0 items-center gap-2">
                    <Button
                      onClick={() =>
                        handlers.handleCopySpecialFormat(link, index)
                      }
                      className="rounded border border-black bg-white/10 px-2 py-1 text-xs font-medium text-black hover:bg-white/20"
                    >
                      {state.copiedIndex === index
                        ? "コピー完了!"
                        : "特殊コピペ"}
                    </Button>
                    <Button
                      onClick={() => handlers.handleRemoveLink(index)}
                      className="rounded text-black hover:text-red-400"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 自分の言葉・たとえ・カテゴリ */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-black">自分の言葉で整理</label>
        <textarea
          value={state.ownWords}
          onChange={(e) => {
            setters.setOwnWords(e.target.value);
            handlers.saveToStorage({ ownWords: e.target.value });
          }}
          className="min-h-[80px] w-full rounded border border-black bg-[#ffffff] p-3 text-black focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-black">たとえを考える</label>
        <textarea
          value={state.metaphor}
          onChange={(e) => {
            setters.setMetaphor(e.target.value);
            handlers.saveToStorage({ metaphor: e.target.value });
          }}
          className="min-h-[80px] w-full rounded border border-black bg-[#ffffff] p-3 text-black focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-black">カテゴリ登録</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="カテゴリを入力して追加"
            value={state.categoryInput}
            onChange={(e) => setters.setCategoryInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handlers.addCategory(state.categoryInput)
            }
            className="flex-1 rounded border border-black bg-[#ffffff] p-2 text-black focus:outline-none"
          />
          <Button
            onClick={() => handlers.addCategory(state.categoryInput)}
            disabled={!state.categoryInput.trim()}
            className="rounded bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            追加
          </Button>
        </div>
        {state.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {state.categories.map((cat, i) => (
              <span
                key={i}
                className="flex items-center gap-1 rounded bg-blue-500/20 px-2 py-1 text-xs font-semibold text-black"
              >
                {cat}
                <Button
                  onClick={() => {
                    const newCats = state.categories.filter(
                      (_, idx) => idx !== i,
                    );
                    setters.setCategories(newCats);
                    handlers.saveToStorage({ categories: newCats });
                  }}
                  className="ml-1 text-white hover:text-black"
                >
                  ✕
                </Button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handlers.handleComplete}
          disabled={state.isSubmitting || !state.details.trim()}
          className="rounded-lg bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {state.isSubmitting ? "送信中..." : "完了"}
        </Button>
      </div>
    </div>
  );
}
