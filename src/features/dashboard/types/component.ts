import type { ParsedStockIdea } from "./database";

export interface IdeaDetailModalProps {
  idea: ParsedStockIdea;
  onClose: () => void;
}
