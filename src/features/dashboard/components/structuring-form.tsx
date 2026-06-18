"use client";

import { StructuringItem } from "../types";

interface Props {
  data: StructuringItem;
  onChange: <
    S extends keyof StructuringItem,
    F extends keyof StructuringItem[S],
  >(
    section: S,
    field: F,
    value: string,
  ) => void;
}

export default function StructuringForm({ data, onChange }: Props) {
  console.log("data", data);
  const fields = [
    {
      section: "Purpose",
      field: "who",
      label: "誰が？",
      color: "font-bold text-black",
    },
    {
      section: "Purpose",
      field: "when",
      label: "いつ？",
      color: "font-bold text-black",
    },
    {
      section: "Purpose",
      field: "whom",
      label: "誰と？",
      color: "font-bold text-black",
    },
    {
      section: "Purpose",
      field: "what",
      label: "何をするために？",
      color: "font-bold text-black",
    },
  ] as const;

  return (
    <div className="flex flex-col gap-3 rounded border border-black bg-[#ffffff] p-4">
      <h3 className="font-bold text-black">構造化トレーニング</h3>
      <p className="font-bold text-black">
        ※ 関連しない項目は空欄のままスキップしてください。
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((item) => {
          const id = `${item.section}.${item.field}`;

          return (
            <label key={id} htmlFor={id} className="flex flex-col gap-1">
              <span>{item.label}</span>
              <input
                id={id}
                value={data[item.section][item.field]}
                onChange={(e) =>
                  onChange(item.section, item.field, e.target.value)
                }
                className="rounded border border-black px-2 py-1"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
