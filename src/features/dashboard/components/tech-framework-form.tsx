"use client";

import { TechnicalUnderstanding } from "../types";

interface Props {
  data: TechnicalUnderstanding;
  onChange: (field: keyof TechnicalUnderstanding, value: string) => void;
}

export default function TechFrameworkForm({ data, onChange }: Props) {
  const fields: {
    key: keyof TechnicalUnderstanding;
    label: string;
    color: string;
  }[] = [
    { key: "why", label: "なぜ存在するのか？", color: "font-bold text-black" },
    {
      key: "problem",
      label: "何を解決するのか？",
      color: "font-bold text-black",
    },
    {
      key: "difference",
      label: "それぞれどんな違いがある？",
      color: "font-bold text-black",
    },
    {
      key: "mechanism",
      label: "内部で何が起きているのか？",
      color: "font-bold text-black",
    },
    { key: "trigger", label: "いつ動くのか？", color: "font-bold text-black" },
    {
      key: "without",
      label: "無かったら何が困るのか？",
      color: "font-bold text-black",
    },
    {
      key: "demerit",
      label: "それを使うデメリット",
      color: "font-bold text-black",
    },
    {
      key: "situation",
      label: "どんな場面で使うべきか？",
      color: "font-bold text-black",
    },
    {
      key: "analogy",
      label: "何に似ているのか？",
      color: "font-bold text-black",
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded border border-black bg-[#ffffff] p-4">
      <h3 className="font-bold text-black">理解フレームワーク（技術・概念）</h3>
      <p className="font-bold text-black">
        ※ 関連しない項目は空欄のままスキップしてください。
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map(({ key, label, color }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className={`text-xs font-bold ${color}`}>{label}</label>
            <input
              type="text"
              // value={data[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full rounded border border-black bg-[#ffffff] p-2 text-sm text-black focus:border-black focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
