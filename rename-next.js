const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "out");
const oldNextDir = path.join(outDir, "_next");
const newNextDir = path.join(outDir, "assets");

// 1. _next の中身を assets へ安全にコピーし、元の _next を削除
if (fs.existsSync(oldNextDir)) {
  if (fs.existsSync(newNextDir)) {
    fs.rmSync(newNextDir, { recursive: true, force: true });
  }
  fs.cpSync(oldNextDir, newNextDir, { recursive: true });
  fs.rmSync(oldNextDir, { recursive: true, force: true });
}

// 2. 「_」から始まるファイル・ディレクトリの完全クリーンアップ
if (fs.existsSync(outDir)) {
  const outDirEntries = fs.readdirSync(outDir);
  for (const entry of outDirEntries) {
    if (entry.startsWith("_")) {
      const fullPath = path.join(outDir, entry);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }
}

// 3. パスの一括置換 と インラインスクリプトの外部ファイル化（CSP対策）
function processBuildFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processBuildFiles(fullPath);
    } else if (/\.(html|js|css|json)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, "utf-8");

      // パスの置換
      content = content.replace(/\/_next\//g, "/assets/");
      content = content.replace(/\\\/_next\\\//g, "\\/assets\\/");
      content = content.replace(/_next\//g, "assets/");

      // CSP対策: HTML内のインラインスクリプトを外部JSファイルに切り出す
      if (/\.html$/.test(entry.name)) {
        let scriptCounter = 0;

        // src属性を持たない、かつ JSONデータではない実行可能な <script> タグを抽出
        content = content.replace(
          /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
          (match, attributes, scriptContent) => {
            // src属性があるもの、またはデータ定義(application/jsonなど)はスキップ
            if (
              attributes.includes("src=") ||
              attributes.includes('type="application/')
            ) {
              return match;
            }

            if (scriptContent && scriptContent.trim().length > 0) {
              scriptCounter++;
              const fileName = `${entry.name.replace(".html", "")}-inline-${scriptCounter}.js`;
              const filePath = path.join(dir, fileName);

              // 抽出したスクリプトを別ファイルとして書き出す
              fs.writeFileSync(filePath, scriptContent, "utf-8");

              // 元のHTMLを外部ファイル読み込みに置換する
              return `<script${attributes} src="${fileName}"></script>`;
            }
            return match;
          },
        );
      }

      // 変更を上書き保存
      fs.writeFileSync(fullPath, content, "utf-8");
    }
  }
}

processBuildFiles(outDir);
console.log(
  "✅ Chrome拡張機能向けにビルドを最適化しました（_next移行、アンダースコア削除、CSP対応完了）。",
);
