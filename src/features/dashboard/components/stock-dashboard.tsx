import RegistrationForm from "./registration-form";
import SearchPanel from "./search-panel";

export default function StockDashboard() {
  return (
    <div className="flex h-full w-full gap-4 p-4">
      {/* 左側：登録パネル（配置の指定） */}
      <div className="flex w-1/2 flex-col">
        <RegistrationForm />
      </div>

      {/* 右側：検索・確認パネル（配置の指定） */}
      <div className="flex w-1/2 flex-col">
        <SearchPanel />
      </div>
    </div>
  );
}
