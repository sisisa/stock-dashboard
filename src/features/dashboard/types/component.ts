import type { StockIdea } from "./database";

export interface IdeaDetailModalProps {
  idea: StockIdea;
  onClose: () => void;
}
