import { Book, BookStatus, Series } from "@/lib/types";

export type SortMode = "release" | "chronological" | "title" | "author";

export interface BookFilterOptions {
  query: string;
  status: "all" | BookStatus;
  author: "all" | string;
  sortMode: SortMode;
}

const compareOptionalNumber = (a?: number, b?: number) => {
  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  return a - b;
};

export const filterAndSortBooks = (books: Book[], options: BookFilterOptions): Book[] => {
  const query = options.query.trim().toLowerCase();

  return books
    .filter((book) => {
      if (options.status !== "all" && book.status !== options.status) {
        return false;
      }

      if (options.author !== "all" && book.author !== options.author) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (options.sortMode === "release") {
        const releaseCompare = compareOptionalNumber(a.releaseOrder, b.releaseOrder);
        if (releaseCompare !== 0) return releaseCompare;
      }

      if (options.sortMode === "chronological") {
        const chronoCompare = compareOptionalNumber(
          a.chronologicalOrder,
          b.chronologicalOrder,
        );
        if (chronoCompare !== 0) return chronoCompare;
      }

      if (options.sortMode === "author") {
        const authorCompare = a.author.localeCompare(b.author);
        if (authorCompare !== 0) return authorCompare;
      }

      return a.title.localeCompare(b.title);
    });
};

export const buildSeriesMap = (series: Series[]) =>
  new Map(series.map((entry) => [entry.id, entry]));
