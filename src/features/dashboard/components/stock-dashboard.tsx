"use client";

import { useState } from "react";
import RegistrationForm from "./registration-form";
import SearchPanel from "./search-panel";

export default function StockDashboard() {
  // 右ペイン（検索パネル）の開閉状態を管理。初期状態は開いている（true）
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  const toggleRightPanel = () => {
    setIsRightPanelOpen((prev) => !prev);
  };

  return (
    <div className="bg-background text-foreground flex h-screen w-full overflow-hidden">
      {/* 左側：登録パネル（右ペインが閉じている時は w-full で画面いっぱいに広がる） */}
      <div
        className={`h-full overflow-y-auto transition-all duration-300 ${
          isRightPanelOpen ? "w-1/2 border-r border-white/10" : "w-full"
        }`}
      >
        <RegistrationForm
          isRightPanelOpen={isRightPanelOpen}
          onToggleRightPanel={toggleRightPanel}
        />
      </div>

      {/* 右側：確認・検索パネル（isRightPanelOpenがtrueの時のみレンダリング） */}
      {isRightPanelOpen && (
        <div className="h-full w-1/2 overflow-y-auto p-4 transition-all duration-300">
          <SearchPanel />
        </div>
      )}
    </div>
  );
}
