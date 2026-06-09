"use client";

import { useState, useRef, useEffect } from "react";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "選択または入力...",
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 外側クリックでサジェストリストを閉じる処理
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  // 入力された文字で候補を動的に絞り込む（大文字・小文字を区別しない）
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full min-w-[160px] rounded border border-white/10 bg-[#121214] p-2 pr-8 text-sm text-white/90 focus:border-white/30 focus:outline-none"
        />
        {/* 値が入力されている場合のみ✕ボタンを表示 */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-white/40 hover:text-white/80"
          >
            ✕
          </button>
        )}
      </div>

      {/* 候補が存在し、かつ開いている場合のみリストを表示 */}
      {isOpen && filteredOptions.length > 0 && (
        <div className="custom-scrollbar absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a1c] shadow-2xl">
          {filteredOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(opt)}
              className="w-full px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 hover:text-white"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
