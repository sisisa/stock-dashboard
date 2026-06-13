"use client";

import { ThinkingTraining } from "../types";

interface Props {
  data: ThinkingTraining;
  onChange: (newData: ThinkingTraining) => void;
}

export default function TrainingFrameworkForm({ data, onChange }: Props) {
  const updateNested = (
    section: keyof ThinkingTraining,
    field: string,
    value: string | string[],
    index?: number,
  ) => {
    const newData = { ...data };
    if (
      index !== undefined &&
      Array.isArray((newData[section] as any)[field])
    ) {
      (newData[section] as any)[field][index] = value;
    } else {
      (newData[section] as any)[field] = value;
    }
    onChange(newData);
  };

  const updateRoot = (field: keyof ThinkingTraining, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="flex flex-col gap-6 rounded border border-white bg-[#1a1a1c] p-4">
      <h3 className="font-bold text-white">思考トレーニングモード</h3>
      <p className="-mt-4 text-white">
        ※ 関連しない項目は空欄のままスキップしてください。
      </p>

      {/* 導入 */}
      <div className="grid grid-cols-1 gap-3">
        <label className="text-white">テーマ</label>
        <input
          type="text"
          value={data.theme}
          onChange={(e) => updateRoot("theme", e.target.value)}
          className="w-full rounded border border-white bg-[#121214] p-2 text-white focus:outline-none"
        />
        <label className="text-white">今日の論点</label>
        <input
          type="text"
          value={data.issue}
          onChange={(e) => updateRoot("issue", e.target.value)}
          className="w-full rounded border border-white bg-[#121214] p-2 text-white focus:outline-none"
        />
        <label className="text-white">今回は考えないこと</label>
        <input
          type="text"
          value={data.exclusion}
          onChange={(e) => updateRoot("exclusion", e.target.value)}
          className="w-full rounded border border-white bg-[#121214] p-2 text-white focus:outline-none"
        />
      </div>

      {/* 5W1H */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <h4 className="col-span-full font-bold text-white">5W1H</h4>
        {Object.entries({
          when: "When (どんな時に問題になるか)",
          where: "Where (どんな場面・環境で関係するか)",
          what: "What (何が起きている/重要か)",
          who: "Who (誰に関係があるか)",
          why: "Why (なぜ考える必要があるか)",
          how: "How (どう向き合えるか)",
        }).map(([k, label]) => (
          <div key={k} className="flex flex-col gap-1">
            <label className="text-white">{label}</label>
            <input
              type="text"
              value={(data.fiveW1H as any)[k]}
              onChange={(e) => updateNested("fiveW1H", k, e.target.value)}
              className="w-full rounded border border-white bg-[#121214] p-2 text-white focus:outline-none"
            />
          </div>
        ))}
      </div>

      {/* Why So / So What */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-white">Why So? (なぜそうなる？)</h4>
          <input
            type="text"
            placeholder="問い"
            value={data.whySo.question}
            onChange={(e) => updateNested("whySo", "question", e.target.value)}
            className="mb-1 w-full rounded border border-white bg-[#121214] p-2 text-white"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <input
              key={i}
              type="text"
              placeholder={`深掘り ${i + 1}`}
              value={data.whySo.answers[i]}
              onChange={(e) =>
                updateNested("whySo", "answers", e.target.value, i)
              }
              className="w-full rounded border border-white bg-[#121214] p-2 text-white"
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-bold text-white">
            So What? (それってどういうこと？)
          </h4>
          <input
            type="text"
            placeholder="問い"
            value={data.soWhat.question}
            onChange={(e) => updateNested("soWhat", "question", e.target.value)}
            className="mb-1 w-full rounded border border-white bg-[#121214] p-2 text-white"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <input
              key={i}
              type="text"
              placeholder={`深掘り ${i + 1}`}
              value={data.soWhat.answers[i]}
              onChange={(e) =>
                updateNested("soWhat", "answers", e.target.value, i)
              }
              className="w-full rounded border border-white bg-[#121214] p-2 text-white"
            />
          ))}
        </div>
      </div>

      {/* 共通点・構造 */}
      <div className="flex flex-col gap-3">
        <h4 className="font-bold text-white">共通点の抽出</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="対象A"
            value={data.commonalities.targetA}
            onChange={(e) =>
              updateNested("commonalities", "targetA", e.target.value)
            }
            className="w-full rounded border border-white bg-[#121214] p-2 text-white"
          />
          <input
            type="text"
            placeholder="対象B"
            value={data.commonalities.targetB}
            onChange={(e) =>
              updateNested("commonalities", "targetB", e.target.value)
            }
            className="w-full rounded border border-white bg-[#121214] p-2 text-white"
          />
        </div>
        <textarea
          placeholder="共通点 (箇条書きで記載)"
          value={data.commonalities.points.join("\n")}
          onChange={(e) =>
            updateNested("commonalities", "points", e.target.value.split("\n"))
          }
          className="h-24 w-full resize-none rounded border border-white bg-[#121214] p-2 text-white"
        />
        <input
          type="text"
          placeholder="共通構造"
          value={data.commonalities.structure}
          onChange={(e) =>
            updateNested("commonalities", "structure", e.target.value)
          }
          className="w-full rounded border border-white bg-[#121214] p-2 text-white"
        />
      </div>

      {/* 論理チェックと一文結論 */}
      <div className="flex flex-col gap-3">
        <h4 className="font-bold text-white">論理チェック & 結論</h4>
        {Object.entries({
          conclusion: "結論",
          reason: "理由",
          example: "具体例",
          meaning: "つまり",
        }).map(([k, label]) => (
          <div key={k} className="flex items-center gap-2">
            <label className="w-16 text-white">{label}</label>
            <input
              type="text"
              value={(data.logicCheck as any)[k]}
              onChange={(e) => updateNested("logicCheck", k, e.target.value)}
              className="flex-1 rounded border border-white bg-[#121214] p-2 text-white"
            />
          </div>
        ))}
        <textarea
          placeholder="一文の結論"
          value={data.oneSentence}
          onChange={(e) => updateRoot("oneSentence", e.target.value)}
          className="mt-2 h-16 w-full resize-none rounded border border-white bg-[#121214] p-2 font-bold text-white"
        />
        <textarea
          placeholder="今日の発見"
          value={data.discovery}
          onChange={(e) => updateRoot("discovery", e.target.value)}
          className="h-16 w-full resize-none rounded border border-white bg-[#121214] p-2 text-white"
        />
      </div>
    </div>
  );
}
