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

// 2. 【最終対応】「_」から始まるファイル・ディレクトリの完全クリーンアップ
// Chrome拡張機能では「_」から始まるファイル名は一切許可されません。
// _next 以外の「_」から始まる全ファイル（_not-found, __next._full.txt など）を一掃します。
if (fs.existsSync(outDir)) {
  const outDirEntries = fs.readdirSync(outDir);
  for (const entry of outDirEntries) {
    if (entry.startsWith("_")) {
      const fullPath = path.join(outDir, entry);
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }
}

// 3. 出力されたHTML, JS, CSS, JSONファイル内の参照パスを一括置換
function replacePaths(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      replacePaths(fullPath);
    } else if (/\.(html|js|css|json)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, "utf-8");

      // "/_next/" -> "/assets/"
      let newContent = content.replace(/\/_next\//g, "/assets/");
      // JSやJSON等でエスケープされている "\/_next\/" -> "\/assets\/"
      newContent = newContent.replace(/\\\/_next\\\//g, "\\/assets\\/");
      // 一部の相対パス表記 "_next/" -> "assets/"
      newContent = newContent.replace(/_next\//g, "assets/");

      // 変更があった場合のみ上書き保存
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, "utf-8");
      }
    }
  }
}

replacePaths(outDir);
console.log(
  "✅ Chrome拡張機能向けに _next の移行と、「_」から始まる全ファイルの完全削除を行い、参照パスを置換しました。",
);
