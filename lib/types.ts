export const APP_STATE_VERSION = 1;

export const BOOK_STATUSES = ["to-read", "reading", "completed"] as const;

export type BookStatus = (typeof BOOK_STATUSES)[number];

export interface Series {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookFileMeta {
  name: string;
  type: string;
  lastAttachedAt: string;
}

export interface Book {
  id: string;
  seriesId: string;
  title: string;
  author: string;
  releaseOrder?: number;
  chronologicalOrder?: number;
  status: BookStatus;
  isRead: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  file?: BookFileMeta;
}

export interface AppState {
  version: number;
  series: Series[];
  books: Book[];
}

export interface BookDraft {
  seriesId: string;
  title: string;
  author: string;
  releaseOrder?: number;
  chronologicalOrder?: number;
  status: BookStatus;
  notes?: string;
  file?: BookFileMeta;
}
