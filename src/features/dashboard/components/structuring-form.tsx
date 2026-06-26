"use client";

import type { StructuringItem } from "../types/training";
import { sections } from "../types/training";

/**
 * このフォームが受け取るProps
 *
 * data
 *   入力済みのデータ
 *
 * onChange
 *   入力が変更された時に親へ通知する関数
 */
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

  onPieceChange: (index: number, value: string) => void;
}

export default function StructuringForm({
  data,
  onChange,
  onPieceChange,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-bold text-black">構造化トレーニング</h2>

      <p className="font-bold text-black">
        ※ 関連しない項目は空欄のままスキップしてください。
      </p>
      {sections.map((section) => {
        return (
          <section key={section.key} className="rounded border p-4">
            <h3 className="font-bold text-black">
              {section.title}：{section.description}
            </h3>

            {section.type === "fixed" && (
              <div className="grid gap-3">
                {section.fields.map((field) => {
                  const id = `${section.key}.${field.field}`;

                  return (
                    <label key={id} className="flex flex-col gap-1">
                      <p className="font-bold text-black">{field.label}</p>

                      <input
                        value={data[section.key][field.field]}
                        onChange={(e) =>
                          onChange(section.key, field.field, e.target.value)
                        }
                        className="rounded border border-black px-2 py-1 font-bold text-black"
                      />
                    </label>
                  );
                })}
              </div>
            )}

            {section.type === "dynamic" && (
              <div className="flex flex-col gap-2">
                {data.Piece.map((piece, index) => (
                  <input
                    key={index}
                    value={piece}
                    onChange={(e) => onPieceChange(index, e.target.value)}
                    className="rounded border border-black px-2 py-1 font-bold text-black"
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
