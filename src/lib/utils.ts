import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS のクラス名を結合し、
 * 重複・競合するクラスを自動で整理する
 */
export function cn(...classNames: ClassValue[]) {
  // clsxで条件付きクラスを組み立てる
  const mergedClasses = clsx(classNames);

  // Tailwindの競合クラスを解決する
  return twMerge(mergedClasses);
}
