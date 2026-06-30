import { ParsedStockIdea } from "../types/database";

// 理解フレームワークのオブジェクト
const technicalFields = [
  { key: "why", label: "なぜ存在するのか？" },
  { key: "problem", label: "何を解決するのか？" },
  { key: "difference", label: "それぞれどんな違いがある？" },
  { key: "mechanism", label: "内部で何が起きているのか？" },
  { key: "trigger", label: "いつ動くのか？" },
  { key: "without", label: "無かったら何が困るのか？" },
  { key: "demerit", label: "それを使うデメリット" },
  { key: "situation", label: "どんな場面で使うべきか？" },
  { key: "analogy", label: "何に似ているのか？" },
] as const;

// 構造化トレーニングのオブジェクト
const purposeFields = [
  { key: "who", label: "誰が？" },
  { key: "when", label: "いつ？" },
  { key: "whom", label: "誰と？" },
  { key: "what", label: "何をするために？" },
] as const;

const structuringSections = [
  { key: "Piece", title: "Piece（断片）" },
  { key: "Perspective", title: "Perspective（視点）" },
  { key: "Pillar", title: "Pillar（支柱）" },
  { key: "Presentation", title: "Presentation（表現）" },
] as const;
export const useMarkdown = (filteredIdeas: ParsedStockIdea[]) => {
  /**
   * Markdownダウンロード
   */
  const handleDownloadMarkdown = () => {
    // ダウンロード対象の有無チェック
    const targetIdeas = filteredIdeas;

    if (targetIdeas.length === 0) {
      alert("ダウンロードするデータがありません。");
      return;
    }

    // Markdown文字列を生成
    let mdContent = "# 思考ストック一覧\n\n";

    targetIdeas.forEach((idea) => {
      const date = new Date(idea.createdAt).toLocaleDateString();

      const categories =
        idea.parsedCategories.length > 0
          ? idea.parsedCategories.join(", ")
          : "未分類";

      mdContent += `## [${date}] カテゴリ: ${categories}\n\n`;

      mdContent += `**詳細:**\n${idea.details || "詳細なし"}\n\n`;

      if (idea.parsedUnknownWords.length > 0) {
        mdContent += `**明確にわからない単語と調査した結果:**\n`;

        idea.parsedUnknownWords.forEach((word) => {
          mdContent += `- ${word.word}: ${word.result}\n`;
        });

        mdContent += "\n";
      }

      if (idea.parsedRelatedLinks.length > 0) {
        mdContent += `**関連リンク:**\n`;

        idea.parsedRelatedLinks.forEach((link) => {
          const memo = link.memo ? ` (${link.memo})` : "";

          mdContent += `- [${link.title || link.url}](${link.url})${memo}\n`;
        });

        mdContent += "\n";
      }

      // 理解フレームワーク（技術・概念）
      const tech = idea.parsedTechnicalUnderstanding;

      mdContent += `**理解フレームワーク（技術・概念）**\n\n`;

      technicalFields.forEach(({ key, label }) => {
        mdContent += `### ${label}\n`;
        mdContent += `${tech[key] || "未記載"}\n\n`;
      });

      const training = idea.parsedThinkingTraining;

      mdContent += `## 思考トレーニング\n\n`;

      mdContent += `### テーマ\n`;
      mdContent += `${training.theme || "未記載"}\n\n`;

      mdContent += `### 今日の論点\n`;
      mdContent += `${training.issue || "未記載"}\n\n`;

      const fiveW1HFields = [
        { key: "when", label: "When" },
        { key: "where", label: "Where" },
        { key: "what", label: "What" },
        { key: "who", label: "Who" },
        { key: "why", label: "Why" },
        { key: "how", label: "How" },
      ] as const;

      mdContent += `### 5W1H\n\n`;

      fiveW1HFields.forEach(({ key, label }) => {
        mdContent += `#### ${label}\n`;
        mdContent += `${training.fiveW1H[key] || "未記載"}\n\n`;
      });

      const summaryFields = [
        { key: "a", label: "①" },
        { key: "b", label: "②" },
        { key: "c", label: "③" },
        { key: "common", label: "共通点" },
      ] as const;

      mdContent += `### 他の視点\n\n`;

      summaryFields.forEach(({ key, label }) => {
        mdContent += `#### ${label}\n`;
        mdContent += `${training.otherPerspective[key] || "未記載"}\n\n`;
      });

      mdContent += `### 一文の結論\n`;
      mdContent += `${training.oneSentence || "未記載"}\n\n`;

      mdContent += `### 今日の発見\n`;
      mdContent += `${training.discovery || "未記載"}\n\n`;

      const structuring = idea.parsedStructuringItem;

      mdContent += `## 構造化トレーニング\n\n`;

      mdContent += `### Purpose（目的）\n\n`;

      purposeFields.forEach(({ key, label }) => {
        mdContent += `#### ${label}\n`;
        mdContent += `${structuring.Purpose[key] || "未記載"}\n\n`;
      });

      structuringSections.forEach(({ key, title }) => {
        mdContent += `### ${title}\n\n`;

        const items = structuring[key] ?? [];

        if (items.length === 0) {
          mdContent += "未記載\n\n";
          return;
        }

        items.forEach((item, index) => {
          if (!item.trim()) return;

          mdContent += `${index + 1}. ${item}\n`;
        });

        mdContent += "\n";
      });

      mdContent += "\n";
      // 共通部分
      mdContent += `**自分の言葉で整理:**\n${idea.ownWords || "詳細なし"}\n\n`;

      mdContent += `**たとえ:**\n${idea.metaphor || "詳細なし"}\n\n`;

      mdContent += "---\n\n";
    });

    // Markdownファイル生成
    const blob = new Blob([mdContent], {
      type: "text/markdown;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const today = new Date().toISOString().split("T")[0];

    link.href = url;
    link.download = `思考ストック一覧-${today}.md`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return {
    handleDownloadMarkdown,
  };
};
