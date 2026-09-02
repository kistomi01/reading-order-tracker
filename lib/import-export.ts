import ExcelJS from "exceljs";

import { normalizeAppState } from "@/lib/normalize";
import { AppState, Book, Series } from "@/lib/types";

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const exportAsJsonText = (state: AppState) => {
  const payload = {
    tag: "reading-order-tracker-export",
    exportedAt: new Date().toISOString(),
    ...state,
  };

  return JSON.stringify(payload, null, 2);
};

const triggerDownload = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadJson = (state: AppState) => {
  triggerDownload(
    `reading-order-tracker-${new Date().toISOString().slice(0, 10)}.json`,
    new Blob([exportAsJsonText(state)], { type: "application/json" }),
  );
};

export const downloadTxt = (state: AppState) => {
  triggerDownload(
    `reading-order-tracker-${new Date().toISOString().slice(0, 10)}.txt`,
    new Blob([exportAsJsonText(state)], { type: "text/plain" }),
  );
};

export const downloadXlsx = async (state: AppState) => {
  const workbook = new ExcelJS.Workbook();
  const seriesSheet = workbook.addWorksheet("Series");
  const booksSheet = workbook.addWorksheet("Books");

  seriesSheet.addRow(["id", "name", "description", "createdAt", "updatedAt"]);
  state.series.forEach((entry: Series) => {
    seriesSheet.addRow([
      entry.id,
      entry.name,
      entry.description ?? "",
      entry.createdAt,
      entry.updatedAt,
    ]);
  });

  booksSheet.addRow([
    "id",
    "seriesId",
    "title",
    "author",
    "releaseOrder",
    "chronologicalOrder",
    "status",
    "isRead",
    "notes",
    "createdAt",
    "updatedAt",
    "fileName",
    "fileType",
    "fileLastAttachedAt",
  ]);

  state.books.forEach((book: Book) => {
    booksSheet.addRow([
      book.id,
      book.seriesId,
      book.title,
      book.author,
      book.releaseOrder ?? "",
      book.chronologicalOrder ?? "",
      book.status,
      book.isRead,
      book.notes ?? "",
      book.createdAt,
      book.updatedAt,
      book.file?.name ?? "",
      book.file?.type ?? "",
      book.file?.lastAttachedAt ?? "",
    ]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(
    `reading-order-tracker-${new Date().toISOString().slice(0, 10)}.xlsx`,
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
};

const fromSeriesRow = (cells: unknown[]): Series | null => {
  if (typeof cells[0] !== "string" || typeof cells[1] !== "string") {
    return null;
  }

  return {
    id: cells[0],
    name: cells[1],
    description: typeof cells[2] === "string" && cells[2] ? cells[2] : undefined,
    createdAt: typeof cells[3] === "string" && cells[3] ? cells[3] : new Date().toISOString(),
    updatedAt: typeof cells[4] === "string" && cells[4] ? cells[4] : new Date().toISOString(),
  };
};

const parseMaybeNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const fromBookRow = (cells: unknown[]): Book | null => {
  if (
    typeof cells[0] !== "string" ||
    typeof cells[1] !== "string" ||
    typeof cells[2] !== "string" ||
    typeof cells[3] !== "string"
  ) {
    return null;
  }

  const fileName = typeof cells[11] === "string" ? cells[11] : "";
  const fileType = typeof cells[12] === "string" ? cells[12] : "";
  const fileLastAttachedAt = typeof cells[13] === "string" ? cells[13] : "";

  return {
    id: cells[0],
    seriesId: cells[1],
    title: cells[2],
    author: cells[3],
    releaseOrder: parseMaybeNumber(cells[4]),
    chronologicalOrder: parseMaybeNumber(cells[5]),
    status: typeof cells[6] === "string" ? (cells[6] as Book["status"]) : "to-read",
    isRead: Boolean(cells[7]),
    notes: typeof cells[8] === "string" && cells[8] ? cells[8] : undefined,
    createdAt: typeof cells[9] === "string" && cells[9] ? cells[9] : new Date().toISOString(),
    updatedAt: typeof cells[10] === "string" && cells[10] ? cells[10] : new Date().toISOString(),
    file:
      fileName.length > 0
        ? {
            name: fileName,
            type: fileType || "application/octet-stream",
            lastAttachedAt: fileLastAttachedAt || new Date().toISOString(),
          }
        : undefined,
  };
};

export const importFromJsonOrTxt = async (file: File): Promise<AppState> => {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON/TXT file. Please use a file exported by this app.");
  }

  if (!isObject(parsed)) {
    throw new Error("Invalid JSON/TXT format: expected a JSON object.");
  }

  if ("tag" in parsed && parsed.tag !== "reading-order-tracker-export") {
    throw new Error("Invalid export tag in JSON/TXT file.");
  }

  if (!Array.isArray(parsed.series) || !Array.isArray(parsed.books)) {
    throw new Error("Invalid JSON/TXT structure: missing series/books arrays.");
  }

  const normalized = normalizeAppState(parsed);
  if (
    !normalized ||
    (parsed.series.length > 0 && normalized.series.length === 0) ||
    (parsed.books.length > 0 && normalized.books.length === 0)
  ) {
    throw new Error("Imported JSON/TXT structure is invalid.");
  }

  return normalized;
};

export const importFromXlsx = async (file: File): Promise<AppState> => {
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);

  const seriesSheet = workbook.getWorksheet("Series");
  const booksSheet = workbook.getWorksheet("Books");

  if (!seriesSheet || !booksSheet) {
    throw new Error("Invalid XLSX format: missing Series or Books worksheet.");
  }

  const series: Series[] = [];
  seriesSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const entry = fromSeriesRow((row.values as unknown[]).slice(1));
    if (entry) {
      series.push(entry);
    }
  });

  const books: Book[] = [];
  booksSheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const entry = fromBookRow((row.values as unknown[]).slice(1));
    if (entry) {
      books.push(entry);
    }
  });

  const normalized = normalizeAppState({ version: 1, series, books });
  if (!normalized) {
    throw new Error("Imported XLSX structure is invalid.");
  }

  return normalized;
};
