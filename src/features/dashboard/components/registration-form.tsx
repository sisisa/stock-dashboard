"use client";

import { useState, useEffect } from "react";
import { addStockIdea } from "../api/gas-client";
import {
  StockIdeaInput,
  TechnicalUnderstanding,
  UnknownWord,
  LinkItem,
  DraftData,
} from "../types";
import { Button } from "@/components/ui/button";

export default function RegistrationForm() {
  const [details, setDetails] = useState("");
  const [unknownWords, setUnknownWords] = useState<UnknownWord[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);

  // リンク入力用のステート（3つに分割）
  const [linkMemo, setLinkMemo] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  const [ownWords, setOwnWords] = useState("");
  const [metaphor, setMetaphor] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // コピー完了時のフィードバック用ステート
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [techUnderstanding, setTechUnderstanding] =
    useState<TechnicalUnderstanding>({
      why: "",
      problem: "",
      analogy: "",
      mechanism: "",
      trigger: "",
      without: "",
    });

  // 1. ローカルストレージからの復元
  useEffect(() => {
    const savedData = localStorage.getItem("draft_idea_stock");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as DraftData;
        // 詳細
        if (parsed.details) setDetails(parsed.details);

        if (parsed.technicalUnderstanding)
          setTechUnderstanding(parsed.technicalUnderstanding);
        if (parsed.unknownWords) setUnknownWords(parsed.unknownWords);
        if (parsed.links) setLinks(parsed.links);
        if (parsed.ownWords) setOwnWords(parsed.ownWords);
        if (parsed.metaphor) setMetaphor(parsed.metaphor);
        if (parsed.categories) setCategories(parsed.categories);
      } catch (error) {
        console.error("Failed to parse draft data", error);
      }
    }
  }, []);

  // 2. 入力ごとの一時保存ロジック
  const saveToStorage = (newData: Partial<DraftData>) => {
    const currentDataRaw = localStorage.getItem("draft_idea_stock");
    const currentData = currentDataRaw ? JSON.parse(currentDataRaw) : {};
    localStorage.setItem(
      "draft_idea_stock",
      JSON.stringify({ ...currentData, ...newData }),
    );
  };

  const handleTechUnderstandingChange = (
    field: keyof TechnicalUnderstanding,
    value: string,
  ) => {
    const newData = { ...techUnderstanding, [field]: value };
    setTechUnderstanding(newData);
    saveToStorage({ technicalUnderstanding: newData });
  };

  // 3. 各入力ハンドラー
  const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDetails(e.target.value);
    saveToStorage({ details: e.target.value });
  };

  const handleOwnWordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOwnWords(e.target.value);
    saveToStorage({ ownWords: e.target.value });
  };

  const handleMetaphorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMetaphor(e.target.value);
    saveToStorage({ metaphor: e.target.value });
  };

  const addUnknownWord = () => {
    const newWords = [...unknownWords, { word: "", result: "" }];
    setUnknownWords(newWords);
    saveToStorage({ unknownWords: newWords });
  };

  const updateUnknownWord = (
    index: number,
    field: keyof UnknownWord,
    value: string,
  ) => {
    const newWords = [...unknownWords];
    newWords[index][field] = value;
    setUnknownWords(newWords);
    saveToStorage({ unknownWords: newWords });
  };

  const addCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const newCategories = [...categories, trimmed];
      setCategories(newCategories);
      saveToStorage({ categories: newCategories });
    }
    setCategoryInput("");
  };

  // 関連リンクの処理

  // 特殊コピペによるパース登録（URL入力欄などでペーストされた時用）
  const handleLinkPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const specialFormatRegex = /<(.*?),\s*(https?:\/\/[^\s,>]+),\s*(.*?)>/;
    const match = pastedText.match(specialFormatRegex);

    if (match) {
      e.preventDefault(); // デフォルトの貼り付けを防止
      const newLinks = [
        ...links,
        { memo: match[1].trim(), url: match[2].trim(), title: match[3].trim() },
      ];
      setLinks(newLinks);
      saveToStorage({ links: newLinks });
    }
  };

  // 3つの入力欄から手動で追加
  const handleAddLink = () => {
    const url = linkUrl.trim();
    if (!url) return; // URLは必須とする

    const newLinks = [
      ...links,
      { memo: linkMemo.trim(), url, title: linkTitle.trim() },
    ];
    setLinks(newLinks);
    saveToStorage({ links: newLinks });

    // 入力欄をクリア
    setLinkMemo("");
    setLinkUrl("");
    setLinkTitle("");
  };

  // 特殊コピペ出力
  const handleCopySpecialFormat = (link: LinkItem, index: number) => {
    const formatStr = `<${link.memo}, ${link.url}, ${link.title}>`;
    navigator.clipboard
      .writeText(formatStr)
      .then(() => {
        // 成功したら2秒間だけ「コピー完了!」表示にする
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy!", err);
      });
  };

  // リンクの削除（誤操作時のリカバリ用）
  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    saveToStorage({ links: newLinks });
  };

  // 4. 送信処理
  const handleComplete = async () => {
    if (!details.trim()) return;

    setIsSubmitting(true);
    const payload: StockIdeaInput = {
      details,
      technicalUnderstanding: JSON.stringify(techUnderstanding),
      unknownWords: JSON.stringify(unknownWords),
      relatedLinks: JSON.stringify(links), // 登録された全リンクをJSON化して送信
      ownWords,
      metaphor,
      categories: JSON.stringify(categories),
    };

    const res = await addStockIdea(payload);
    if (res) {
      localStorage.removeItem("draft_idea_stock");
      setDetails("");
      setUnknownWords([]);
      setLinks([]);
      setOwnWords("");
      setMetaphor("");
      setCategories([]);
    } else {
      alert("登録に失敗しました");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="custom-scrollbar flex h-full flex-col gap-5 overflow-y-auto rounded-xl border border-white bg-white/5 p-5">
      <h2 className="text-xl font-bold">アイデア・メモの登録</h2>

      {/* 詳細の記載 */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-white">詳細の記載</label>
        <textarea
          value={details}
          onChange={handleDetailsChange}
          placeholder="ここに詳細を記載します..."
          className="min-h-[100px] w-full rounded border border-white bg-[#121214] p-3 text-white/90 focus:border-white focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3 rounded border border-white bg-[#1a1a1c] p-4">
        <h3 className="text-sm font-bold text-white">技術理解フレームワーク</h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Why */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white">
              Why (なぜ存在するのか？)
            </label>
            <input
              type="text"
              value={techUnderstanding.why}
              onChange={(e) =>
                handleTechUnderstandingChange("why", e.target.value)
              }
              className="w-full rounded border border-white bg-[#121214] p-2 text-sm text-white focus:border-white focus:outline-none"
            />
          </div>
          {/* Problem */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white">
              Problem (何を解決するのか？)
            </label>
            <input
              type="text"
              value={techUnderstanding.problem}
              onChange={(e) =>
                handleTechUnderstandingChange("problem", e.target.value)
              }
              className="w-full rounded border border-white bg-[#121214] p-2 text-sm text-white focus:border-white focus:outline-none"
            />
          </div>
          {/* Analogy */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white">
              Analogy (何に似ているか？)
            </label>
            <input
              type="text"
              value={techUnderstanding.analogy}
              onChange={(e) =>
                handleTechUnderstandingChange("analogy", e.target.value)
              }
              className="w-full rounded border border-white bg-[#121214] p-2 text-sm text-white focus:border-white focus:outline-none"
            />
          </div>
          {/* Mechanism */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white">
              Mechanism (内部で何が起きているのか？)
            </label>
            <input
              type="text"
              value={techUnderstanding.mechanism}
              onChange={(e) =>
                handleTechUnderstandingChange("mechanism", e.target.value)
              }
              className="w-full rounded border border-white bg-[#121214] p-2 text-sm text-white/90 focus:border-white focus:outline-none"
            />
          </div>
          {/* Trigger */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white">
              Trigger (いつ動くのか？)
            </label>
            <input
              type="text"
              value={techUnderstanding.trigger}
              onChange={(e) =>
                handleTechUnderstandingChange("trigger", e.target.value)
              }
              className="w-full rounded border border-white bg-[#121214] p-2 text-sm text-white/90 focus:border-white focus:outline-none"
            />
          </div>
          {/* Without */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-white">
              Without (無かったら何が困るのか？)
            </label>
            <input
              type="text"
              value={techUnderstanding.without}
              onChange={(e) =>
                handleTechUnderstandingChange("without", e.target.value)
              }
              className="w-full rounded border border-white bg-[#121214] p-2 text-sm text-white/90 focus:border-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* わからない単語と調査した結果 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-white">
            わからない単語と調査した結果
          </label>
        </div>
        {unknownWords.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              placeholder="単語"
              value={item.word}
              onChange={(e) => updateUnknownWord(index, "word", e.target.value)}
              className="w-1/3 rounded border border-white bg-[#121214] p-2 text-white/90 focus:border-white focus:outline-none"
            />
            <input
              type="text"
              placeholder="調査結果"
              value={item.result}
              onChange={(e) =>
                updateUnknownWord(index, "result", e.target.value)
              }
              className="w-2/3 rounded border border-white bg-[#121214] p-2 text-white/90 focus:border-white focus:outline-none"
            />
          </div>
        ))}
        <div className="flex items-center justify-end">
          <Button
            onClick={addUnknownWord}
            className="bg-primary hover:bg-primary text-primary-foreground gap-2"
          >
            追加
          </Button>
        </div>
      </div>

      {/* ★ 関連リンク（今回の改修箇所） */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-white">
          関連リンク (課題対応コピペ対応)
        </label>

        {/* 入力フォーム群 */}
        <div className="flex flex-col gap-2 rounded border border-white bg-[#121214] p-3">
          <input
            type="text"
            placeholder="リンクのメモ"
            value={linkMemo}
            onChange={(e) => setLinkMemo(e.target.value)}
            className="w-full rounded border border-white bg-white/5 p-2 text-white/90 focus:border-white focus:outline-none"
          />
          {/* 既存の特殊コピペ機能は、URL欄にペーストされたときに発火させる */}
          <input
            type="url"
            placeholder="関連リンクURL (必須 / ここに特殊コピペの貼り付けも可)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onPaste={handleLinkPaste}
            className="w-full rounded border border-white bg-white/5 p-2 text-white/90 focus:border-white focus:outline-none"
          />
          <input
            type="text"
            placeholder="リンクタイトル"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            className="w-full rounded border border-white bg-white/5 p-2 text-white/90 focus:border-white focus:outline-none"
          />
          <div className="mt-1 flex justify-end">
            <button
              type="button"
              onClick={handleAddLink}
              disabled={!linkUrl.trim()}
              className="rounded bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              追加
            </button>
          </div>
        </div>

        {/* 追加されたリンクのリストと特殊コピペ出力 */}
        {links.length > 0 && (
          <ul className="flex flex-col gap-2">
            {links.map((link, index) => (
              <li
                key={index}
                className="flex flex-col gap-1 rounded border border-white bg-white/5 p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col overflow-hidden">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-bold text-blue-400 hover:underline"
                    >
                      {link.title || link.url}
                    </a>
                    {link.memo && (
                      <p className="mt-1 text-xs text-white/60">{link.memo}</p>
                    )}
                  </div>
                  <div className="ml-2 flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopySpecialFormat(link, index)}
                      className="rounded border border-white bg-white/10 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20 hover:text-white"
                      title="<メモ, URL, タイトル>の形式でコピー"
                    >
                      {copiedIndex === index ? "コピー完了!" : "特殊コピペ"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="rounded text-white/40 transition-colors hover:text-red-400"
                      title="削除"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 自分の言葉で整理 */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-white">自分の言葉で整理</label>
        <textarea
          value={ownWords}
          onChange={handleOwnWordsChange}
          className="min-h-[80px] w-full rounded border border-white bg-[#121214] p-3 text-white/90 focus:border-white focus:outline-none"
        />
      </div>

      {/* たとえを考える */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-white">たとえを考える</label>
        <textarea
          value={metaphor}
          onChange={handleMetaphorChange}
          className="min-h-[80px] w-full rounded border border-white bg-[#121214] p-3 text-white/90 focus:border-white focus:outline-none"
        />
      </div>

      {/* カテゴリ登録 */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-white">カテゴリ登録</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="カテゴリを入力して追加"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory(categoryInput)}
            className="flex-1 rounded border border-white bg-[#121214] p-2 text-white/90 focus:border-white focus:outline-none"
          />
          <button
            onClick={() => addCategory(categoryInput)}
            disabled={!categoryInput.trim()}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            追加
          </button>
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((cat, i) => (
              <span
                key={i}
                className="flex items-center gap-1 rounded bg-blue-500/20 px-2 py-1 text-xs font-semibold text-blue-300"
              >
                {cat}
                <button
                  onClick={() => {
                    const newCats = categories.filter((_, idx) => idx !== i);
                    setCategories(newCats);
                    saveToStorage({ categories: newCats });
                  }}
                  className="ml-1 text-blue-300/50 hover:text-blue-300"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleComplete}
          disabled={isSubmitting || !details.trim()}
          className="rounded-lg bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? "送信中..." : "完了"}
        </button>
      </div>
    </div>
  );
}
