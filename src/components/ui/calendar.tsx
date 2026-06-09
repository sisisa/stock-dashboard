"use client";

import { useState, useEffect } from "react";

interface CalendarProps {
  value?: Date;
  onChange: (date: Date) => void;
}

export function Calendar({ value, onChange }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(value || new Date());

  // 【追加】外部（手入力）から value が指定・変更された場合、カレンダーの表示月をそれに追従させる
  useEffect(() => {
    if (value && !isNaN(value.getTime())) {
      setCurrentMonth(value);
    }
  }, [value]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  return (
    <div className="w-64 rounded-xl border border-white/10 bg-[#1a1a1c] p-3 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="rounded px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white"
        >
          &lt;
        </button>
        <span className="text-sm font-bold text-white/90">
          {year}年 {month + 1}月
        </span>
        <button
          onClick={handleNextMonth}
          className="rounded px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white"
        >
          &gt;
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-white/50">
        {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {days.map((date, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center"
          >
            {date ? (
              <button
                onClick={() => onChange(date)}
                className={`flex h-full w-full items-center justify-center rounded hover:bg-blue-500/50 ${
                  value && date.toDateString() === value.toDateString()
                    ? "bg-blue-500 font-bold text-white"
                    : "text-white/80"
                }`}
              >
                {date.getDate()}
              </button>
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
