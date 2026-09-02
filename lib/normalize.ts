import {
  APP_STATE_VERSION,
  AppState,
  Book,
  BOOK_STATUSES,
  BookFileMeta,
  BookStatus,
  Series,
} from "@/lib/types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeStatus = (value: unknown): BookStatus => {
  if (typeof value === "string" && BOOK_STATUSES.includes(value as BookStatus)) {
    return value as BookStatus;
  }
  return "to-read";
};

const normalizeFile = (value: unknown): BookFileMeta | undefined => {
  if (!isObject(value) || typeof value.name !== "string") {
    return undefined;
  }

  return {
    name: value.name,
    type: typeof value.type === "string" ? value.type : "application/octet-stream",
    lastAttachedAt:
      typeof value.lastAttachedAt === "string"
        ? value.lastAttachedAt
        : new Date().toISOString(),
  };
};

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const normalizeSeries = (value: unknown): Series | null => {
  if (!isObject(value) || typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }

  const now = new Date().toISOString();
  return {
    id: value.id,
    name: value.name,
    description: typeof value.description === "string" ? value.description : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : now,
  };
};

const normalizeBook = (value: unknown, validSeriesIds: Set<string>): Book | null => {
  if (
    !isObject(value) ||
    typeof value.id !== "string" ||
    typeof value.seriesId !== "string" ||
    typeof value.title !== "string" ||
    typeof value.author !== "string"
  ) {
    return null;
  }

  if (!validSeriesIds.has(value.seriesId)) {
    return null;
  }

  const status = normalizeStatus(value.status);
  const now = new Date().toISOString();

  return {
    id: value.id,
    seriesId: value.seriesId,
    title: value.title,
    author: value.author,
    releaseOrder: parseNumber(value.releaseOrder),
    chronologicalOrder: parseNumber(value.chronologicalOrder),
    status,
    isRead: typeof value.isRead === "boolean" ? value.isRead : status === "completed",
    notes: typeof value.notes === "string" ? value.notes : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : now,
    file: normalizeFile(value.file),
  };
};

export const normalizeAppState = (value: unknown): AppState | null => {
  if (!isObject(value)) {
    return null;
  }

  const rawSeries = Array.isArray(value.series) ? value.series : [];
  const series = rawSeries.map(normalizeSeries).filter((entry): entry is Series => Boolean(entry));
  const validSeriesIds = new Set(series.map((entry) => entry.id));

  const rawBooks = Array.isArray(value.books) ? value.books : [];
  const books = rawBooks
    .map((entry) => normalizeBook(entry, validSeriesIds))
    .filter((entry): entry is Book => Boolean(entry));

  return {
    version: APP_STATE_VERSION,
    series,
    books,
  };
};
