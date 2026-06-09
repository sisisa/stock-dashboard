"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar } from "./calendar";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "日付を選択",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  // タイピング中の文字列を保持するためのステート
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // 親から渡された value が変わった時に inputValue を同期する
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 外側クリックでカレンダーを閉じる処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dateValue =
    value && !isNaN(new Date(value).getTime()) ? new Date(value) : undefined;

  // カレンダーのUIから日付をクリックされたときの処理
  const handleSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formatted = `${year}-${month}-${day}`;
    setInputValue(formatted);
    onChange(formatted);
    // 日付選択後はカレンダーを閉じる
    setIsOpen(false);
  };

  // 手入力されたときの処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // YYYY-MM-DD や YYYY/MM/DD として有効な日付か簡易チェック
    const parsedDate = new Date(val);
    if (!isNaN(parsedDate.getTime()) && val.length >= 8) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
      const day = String(parsedDate.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    } else if (val === "") {
      onChange("");
    }
  };

  // ✕ボタンが押されたときの処理
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // ✕を押した際にカレンダーが開閉するのを防ぐ
    setInputValue("");
    onChange("");
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full min-w-[130px] rounded border border-white/10 bg-[#121214] p-2 pr-8 text-sm text-white/90 focus:border-white/30 focus:outline-none"
        />
        {/* 値が入力されている場合のみ✕ボタンを表示 */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-white/40 hover:text-white/80"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1">
          <Calendar value={dateValue} onChange={handleSelect} />
        </div>
      )}
    </div>
  );
}
