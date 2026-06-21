"use client";

import { useMemo, useEffect } from "react";
import {
  ParsedStockIdea,
  TechnicalUnderstanding,
  ThinkingTraining,
} from "../types";

import { FrameWorksTabs } from "../types/training";
import { IdeaDetailModalProps } from "../types/component";

import { cn } from "@/lib/utils";
import { safeParse } from "../utils/parse";

import { useRegistration } from "../hooks/use-registration";
import { Button } from "@/components/ui/button";

// 各フレームワーク呼び出し
import TechFrameworkForm from "./tech-framework-form";
import TrainingFrameworkForm from "./training-framework-form";
import StructuringForm from "./structuring-form";

export default function IdeaDetailModal({
  idea,
  onClose,
}: IdeaDetailModalProps) {
  const { state, setters, handlers } = useRegistration();

  useEffect(() => {
    if (idea && state.id !== idea.id) {
      console.log(setters);
      // 既にパース済みのデータを渡す（useSearch側でパースされている想定）
      handlers.initializeForm(idea as unknown as ParsedStockIdea);
    }
  }, [idea, handlers]);

  const onSave = async () => {
    const success = await handlers.handleComplete();
    if (success) {
      alert("更新が完了しました。");
      onClose();
      window.location.reload(); // 一覧への反映を確実にするため
    }
  };

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
    colorClass: string = "text-black-400",
  ) => {
    if (!value || value.trim() === "") return null;
    return (
      <div className="mb-2 flex flex-col">
        <span className={`font-bold ${colorClass}`}>{label}</span>
        <span className="whitespace-pre-wrap text-black">{value}</span>
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
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      {/* 
        理由: ダイアログのサイズを大きくするため、max-w-2xl から max-w-4xl に変更。
        また、高さを max-h-full とし、内部で overflow-y-auto を指定することで、
        情報量が多くなっても画面からはみ出さずスクロールできるようにしている。
      */}
      <div className="custom-scrollbar flex max-h-full w-full max-w-4xl flex-col gap-6 overflow-y-auto rounded-2xl border border-black/10 bg-[#ffffff] p-6 shadow-2xl">
        {/* ヘッダー部分 */}
        <div className="flex items-start justify-between border-b border-black/10 pb-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-black">詳細情報の確認</h3>

            <div className="mt-4 justify-end">
              <Button
                onClick={onSave}
                className="bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                更新
              </Button>
            </div>

            {/* カテゴリ表示 */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                  <span
                    key={i}
                    className="rounded bg-blue-500 px-2 py-1 font-semibold text-white"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* タブUI: 規約に従い、下線を活用したシンプルなタブ */}
            <div className="flex gap-1">
              {FrameWorksTabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setters.setActiveTab(tab.id)}
                  className={cn(
                    "border-b-2 px-4 py-2 text-sm font-bold transition-all",
                    state.activeTab === tab.id
                      ? "border-black text-black"
                      : "border-transparent text-white hover:text-black",
                  )}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>
          <Button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-black hover:bg-white/10 hover:text-black"
          >
            ✕
          </Button>
        </div>

        {/* コンテンツ部分 */}
        <div className="flex flex-col gap-6 text-sm text-black">
          {/* 詳細の記載 */}
          <div className="flex flex-col gap-2">
            <label className="font-bold">詳細内容</label>
            <textarea
              value={state.details}
              onChange={(e) => setters.setDetails(e.target.value)}
              className="w-full rounded border border-black p-3"
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
        </div>

        {/* 明確にわからない単語と調査結果 */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-black">
            明確にわからない単語と調査した結果
          </h4>
          {unknownWords.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {unknownWords.map((item, index) => (
                <li key={index} className="rounded bg-white p-3">
                  <span className="font-bold text-black">{item.word}</span>
                  <span className="font-bold text-black">：</span>
                  <span className="font-bold text-black">{item.result}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-black">未記載</p>
          )}
        </div>

        {/* 関連リンク */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-black">関連リンク</h4>
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
                    className="font-bold text-black hover:underline"
                  >
                    {link.title || link.url}
                  </a>
                  {link.memo && (
                    <p className="text-xs text-black">{link.memo}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-black">未記載</p>
          )}
        </div>

        {/* 自分の言葉で整理 */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-black">自分の言葉で整理</h4>
          <p className="rounded bg-white p-4 whitespace-pre-wrap text-black">
            {idea.ownWords || "未記載"}
          </p>
        </div>

        {/* たとえを考える */}
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-black">たとえ</h4>
          <p className="rounded bg-white p-4 whitespace-pre-wrap text-black">
            {idea.metaphor || "未記載"}
          </p>
        </div>
      </div>
    </div>
  );
}
