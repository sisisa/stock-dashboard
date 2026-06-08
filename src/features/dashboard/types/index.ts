export interface StockIdea {
  id: number;
  details: string;
  unknownWords: string; // JSON
  relatedLinks: string; // JSON
  ownWords: string;
  metaphor: string;
  categories: string; // JSON
  isUsed: boolean;
  draftUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface RelatedLink {
  memo: string;
  url: string;
  title: string;
}
