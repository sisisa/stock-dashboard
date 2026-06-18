import { useState, useEffect, useMemo } from "react";
import { fetchStockIdeas } from "../api/gas-client";
import {
  ParsedStockIdea,
  TechnicalUnderstanding,
  ThinkingTraining,
  StructuringItem,
  defaultStructuringData,
} from "../types";
import { safeParse } from "../utils/parse";

export function useSearch() {
  const [ideas, setIdeas] = useState<ParsedStockIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ParsedStockIdea | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 検索条件ステート
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // データ取得と初期パース（ここで一括してパースしておくことで、モーダル側での再パースを不要にする）
  useEffect(() => {
    const loadIdeas = async () => {
      setIsLoading(true);
      try {
        const fetchedIdeas = await fetchStockIdeas();
        const parsedIdeas: ParsedStockIdea[] = fetchedIdeas.map((idea) => ({
          ...idea,
          parsedTechnicalUnderstanding: safeParse<TechnicalUnderstanding>(
            idea.technicalUnderstanding,
            {} as TechnicalUnderstanding,
          ),
          parsedStructuringItem: safeParse<StructuringItem>(
            "",
            defaultStructuringData,
          ),
          parsedThinkingTraining: safeParse<ThinkingTraining>(
            idea.thinkingTraining,
            {} as ThinkingTraining,
          ),
          parsedCategories: safeParse<string[]>(idea.categories, []),
          parsedUnknownWords: safeParse<{ word: string; result: string }[]>(
            idea.unknownWords,
            [],
          ),
          parsedRelatedLinks: safeParse<
            { memo: string; url: string; title: string }[]
          >(idea.relatedLinks, []),
        }));

        console.log("parsedIdeas", parsedIdeas);
        setIdeas(parsedIdeas);
      } catch (err) {
        setError("データの取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };
    loadIdeas();
  }, []);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    ideas.forEach((idea) =>
      idea.parsedCategories.forEach((cat) => categories.add(cat)),
    );
    return Array.from(categories);
  }, [ideas]);

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchSearchTerm = idea.details
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory
        ? idea.parsedCategories.some((cat) =>
            cat.toLowerCase().includes(selectedCategory.toLowerCase()),
          )
        : true;
      let matchDate = true;
      if (startDate || endDate) {
        const ideaDate = new Date(idea.createdAt);
        if (startDate && ideaDate < new Date(startDate)) matchDate = false;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (ideaDate > end) matchDate = false;
        }
      }
      return matchSearchTerm && matchCategory && matchDate;
    });
  }, [ideas, searchTerm, selectedCategory, startDate, endDate]);

  // マークダウンダウンロード機能
  const handleDownloadMarkdown = () => {
    // === 1. ダウンロード対象データの有無チェック ===
    // 画面上で検索・絞り込みされた後のデータ（filteredIdeas）を対象とする
    const targetIdeas = filteredIdeas;

    // 出力するデータが1件もない場合はアラートを出して処理を中断する
    if (targetIdeas.length === 0) {
      alert("ダウンロードするデータがありません。");
      return;
    }

    // === 2. マークダウン文字列の構築 ===
    // ファイルの一番上に表示される大見出し（H1）を設定
    let mdContent = "# 思考ストック一覧\n\n";

    console.log("targetIdeas", targetIdeas);
    // 絞り込まれたデータを1件ずつループ処理して、文字列として追記していく
    targetIdeas.forEach((idea) => {
      // 日付を「YYYY/MM/DD」などの分かりやすい形式に変換
      const date = new Date(idea.createdAt).toLocaleDateString();

      // カテゴリが登録されていればカンマ区切りで結合し、なければ「未分類」とする
      const categories =
        idea.parsedCategories.length > 0
          ? idea.parsedCategories.join(", ")
          : "未分類";

      // アイテムごとの中見出し（H2）として、日付とカテゴリを出力
      mdContent += `## [${date}] カテゴリ: ${categories}\n\n`;

      // メインの詳細テキストを出力（空の場合は「詳細なし」とする）
      mdContent += `**詳細:**\n${idea.details || "詳細なし"}\n\n`;

      // わからなかった単語が登録されている場合のみ、箇条書きで出力する
      if (idea.parsedUnknownWords && idea.parsedUnknownWords.length > 0) {
        mdContent += `**明確にわからない単語と調査した結果:**\n`;
        idea.parsedUnknownWords.forEach((wordObj) => {
          mdContent += `- ${wordObj.word}: ${wordObj.result}\n`;
        });
        mdContent += `\n`; // セクション終わりの改行
      }

      // 関連リンクが登録されている場合のみ、マークダウンのリンク記法 [タイトル](URL) で出力する
      if (idea.parsedRelatedLinks && idea.parsedRelatedLinks.length > 0) {
        mdContent += `**関連リンク:**\n`;
        idea.parsedRelatedLinks.forEach((link) => {
          // メモがあれば (メモ) の形式で追記し、タイトルがなければURLをそのまま表示名にする
          const memoStr = link.memo ? ` (${link.memo})` : "";
          mdContent += `- [${link.title || link.url}](${link.url})${memoStr}\n`;
        });
        mdContent += `\n`; // セクション終わりの改行
      }

      mdContent += `**自分の言葉で整理:**\n${idea.ownWords || "詳細なし"}\n\n`;

      mdContent += `**たとえ:**\n${idea.metaphor || "詳細なし"}\n\n`;

      // 各ストックデータの間に区切り線を引いて、次のデータを見やすくする
      mdContent += `---\n\n`;
    });

    // === 3. ファイルデータ（Blob）の生成 ===
    // 構築したテキストデータを、UTF-8エンコードのマークダウンファイルとして扱えるバイナリデータ（Blob）に変換する
    const blob = new Blob([mdContent], {
      type: "text/markdown;charset=utf-8;",
    });

    // ブラウザ上でこのBlobデータにアクセスするための一時的なURL（ObjectURL）を発行する
    const url = URL.createObjectURL(blob);

    // === 4. 自動ダウンロードの発火と後処理 ===
    // HTMLの <a> タグ（リンク）をプログラム上で動的に作成する
    const link = document.createElement("a");

    // 今日の日付を「YYYY-MM-DD」形式で取得（ファイル名に使用するため）
    const today = new Date().toISOString().split("T")[0];

    // リンクの飛び先を先ほど生成した一時URLに設定
    link.href = url;
    // download属性を付けることで、ページ遷移ではなくファイルのダウンロードとして処理させる
    link.setAttribute("download", `思考ストック一覧-${today}.md`);

    // 生成した <a> タグを一時的に画面（DOM）の末尾に追加する
    document.body.appendChild(link);
    // プログラムから強制的にリンクをクリックさせ、ダウンロードを発火させる
    link.click();

    // ダウンロード処理が終わったら、追加した <a> タグを削除して元に戻す
    document.body.removeChild(link);
    // 発行した一時URLのメモリを解放し、ブラウザの負担（メモリリーク）を防ぐ
    URL.revokeObjectURL(url);
  };

  return {
    state: {
      isLoading,
      error,
      filteredIdeas,
      availableCategories,
      searchTerm,
      selectedCategory,
      startDate,
      endDate,
      selectedIdea,
    },
    setters: {
      setSearchTerm,
      setSelectedCategory,
      setStartDate,
      setEndDate,
      setSelectedIdea,
    },
    handlers: { handleDownloadMarkdown },
  };
}
