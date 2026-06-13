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
    { key: "why", label: "Why (なぜ存在するのか？)", color: "text-white" },
    {
      key: "problem",
      label: "Problem (何を解決するのか？)",
      color: "text-white",
    },
    {
      key: "difference",
      label: "Difference (他の類似概念との決定的な違いは？)",
      color: "text-white",
    },
    {
      key: "mechanism",
      label: "Mechanism (内部で何が起きているのか？)",
      color: "text-white",
    },
    { key: "trigger", label: "Trigger (いつ動くのか？)", color: "text-white" },
    {
      key: "without",
      label: "Without (無かったら何が困るのか？)",
      color: "text-white",
    },
    {
      key: "demerit",
      label: "Demerit(それを使うデメリット)",
      color: "text-white",
    },
    {
      key: "situation",
      label: "Situation (どんな場面で使うべきか？)",
      color: "text-white",
    },
    {
      key: "analogy",
      label: "Analogy (何に似ているのか？)",
      color: "text-white",
    },
  ];

  return (
    <div className="flex flex-col gap-3 rounded border border-white/10 bg-[#1a1a1c] p-4">
      <h3 className="text-sm font-bold text-white/80">
        理解フレームワーク（技術・概念）
      </h3>
      <p className="mb-2 text-white">
        ※ 関連しない項目は空欄のままスキップしてください。
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map(({ key, label, color }) => (
          <div key={key} className="flex flex-col gap-1">
            <label className={`text-xs font-bold ${color}`}>{label}</label>
            <input
              type="text"
              value={data[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full rounded border border-white bg-[#121214] p-2 text-sm text-white focus:border-white focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
