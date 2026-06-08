"use client";

import { useState, useEffect, ClipboardEvent, ChangeEvent } from "react";
import { RelatedLink } from "../types";
import { createStockIdea } from "../api/gas-client";

interface StockFormProps {
  onComplete: () => void;
}

export function StockForm({ onComplete }: StockFormProps) {
  const [details, setDetails] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [links, setLinks] = useState<RelatedLink[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ローカルストレージからの復元
  useEffect(() => {
    const saved = localStorage.getItem("draft_idea_stock");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.details) setDetails(parsed.details);
        if (parsed.links) setLinks(parsed.links);
      } catch (error) {
        console.error("Storage parse error", error);
      }
    }
  }, []);

  // 入力時の自動保存
  const saveToStorage = (newData: Record<string, unknown>) => {
    const currentData = localStorage.getItem("draft_idea_stock");
    const current = currentData ? JSON.parse(currentData) : {};
    localStorage.setItem(
      "draft_idea_stock",
      JSON.stringify({ ...current, ...newData }),
    );
  };

  const handleDetailsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDetails(value);
    saveToStorage({ details: value });
  };

  // 特殊コピペの処理
  const handleLinkPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const specialFormatRegex = /<(.*?),\s*(https?:\/\/[^\s,>]+),\s*(.*?)>/;
    const match = pastedText.match(specialFormatRegex);

    if (match) {
      e.preventDefault();
      const newLink = {
        memo: match[1].trim(),
        url: match[2].trim(),
        title: match[3].trim(),
      };
      const updatedLinks = [...links, newLink];
      setLinks(updatedLinks);
      saveToStorage({ links: updatedLinks });
      setLinkInput("");
    }
  };

  const handleSubmit = async () => {
    if (!details.trim()) return;

    setIsSubmitting(true);
    const success = await createStockIdea({
      details,
      unknownWords: "[]",
      relatedLinks: JSON.stringify(links),
      ownWords: "",
      metaphor: "",
      categories: "[]",
    });

    if (success) {
      localStorage.removeItem("draft_idea_stock");
      setDetails("");
      setLinks([]);
      onComplete(); // 成功時に親コンポーネントのリストを再取得
    } else {
      alert("データの送信に失敗しました。");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="custom-scrollbar flex h-full flex-col overflow-y-auto p-5">
      <h2 className="mb-5 text-xl font-bold">アイデア・メモの登録</h2>

      <div className="mb-4 flex flex-col gap-2">
        <label className="text-sm font-semibold text-white/80">
          詳細の記載
        </label>
        <textarea
          value={details}
          onChange={handleDetailsChange}
          placeholder="ここに詳細を記載します..."
          rows={4}
          className="custom-scrollbar w-full rounded-lg border border-white bg-black/40 p-3 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <label className="text-sm font-semibold text-white/80">
          関連リンク（課題対応用コピペ対応）
        </label>
        <input
          type="text"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          onPaste={handleLinkPaste}
          placeholder="<メモ, URL, タイトル> または URL をペースト"
          className="w-full rounded-lg border border-white bg-black/40 p-3 text-sm focus:border-blue-500 focus:outline-none"
        />
        {links.length > 0 && (
          <ul className="mt-2 flex flex-col gap-2">
            {links.map((link, idx) => (
              <li
                key={idx}
                className="rounded border border-white/10 bg-white/5 p-2 text-xs"
              >
                <span className="font-bold text-blue-400">{link.title}</span>
                <span className="mx-2">-</span>
                <span>{link.memo}</span>
                <div className="mt-1 text-white/50">{link.url}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !details.trim()}
          className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? "送信中..." : "完了"}
        </button>
      </div>
    </div>
  );
}
