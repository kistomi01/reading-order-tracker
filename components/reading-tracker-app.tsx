"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { BookPlus, ChartNoAxesCombined, LibraryBig } from "lucide-react";

import { BookForm } from "@/components/book-form";
import { BookList } from "@/components/book-list";
import { Dashboard } from "@/components/dashboard";
import { EpubReaderModal } from "@/components/epub-reader-modal";
import { FilterBar } from "@/components/filter-bar";
import { ImportExportControls } from "@/components/import-export-controls";
import { SeriesManager } from "@/components/series-manager";
import {
  downloadJson,
  downloadTxt,
  downloadXlsx,
  importFromJsonOrTxt,
  importFromXlsx,
} from "@/lib/import-export";
import { buildSeriesMap, filterAndSortBooks, SortMode } from "@/lib/sort-filter";
import { generateId, loadState, saveState } from "@/lib/storage";
import { AppState, Book, BookDraft, BookStatus, Series } from "@/lib/types";

type ViewMode = "series" | "all" | "dashboard";

const nowIso = () => new Date().toISOString();

export function ReadingTrackerApp() {
  const [state, setState] = useState<AppState>(() => loadState());
  const hasMountedRef = useRef(false);

  const [viewMode, setViewMode] = useState<ViewMode>("series");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookStatus>("all");
  const [authorFilter, setAuthorFilter] = useState<"all" | string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("release");

  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [bookFormSeriesId, setBookFormSeriesId] = useState<string | undefined>(undefined);
  const [editingSeries, setEditingSeries] = useState<Series | undefined>(undefined);

  const [readerState, setReaderState] = useState<{ title: string; file: File } | null>(null);
  const [fileCache, setFileCache] = useState<Record<string, File>>({});
  const [bookToAttachFile, setBookToAttachFile] = useState<Book | null>(null);
  const [notice, setNotice] = useState("");

  const attachInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    saveState(state);
  }, [state]);

  const seriesMap = useMemo(() => buildSeriesMap(state.series), [state.series]);

  const authors = useMemo(
    () =>
      [...new Set(state.books.map((book) => book.author).filter((entry) => entry.trim().length > 0))]
        .sort((a, b) => a.localeCompare(b)),
    [state.books],
  );

  const filteredBooks = useMemo(
    () =>
      filterAndSortBooks(state.books, {
        query,
        status: statusFilter,
        author: authorFilter,
        sortMode,
      }),
    [state.books, query, statusFilter, authorFilter, sortMode],
  );

  const applyBookDraft = (
    draft: BookDraft,
    selectedFile: File | null,
    existingBook?: Book,
  ) => {
    const timestamp = nowIso();
    const nextStatus = draft.status;

    if (existingBook) {
      const updated: Book = {
        ...existingBook,
        ...draft,
        status: nextStatus,
        isRead: nextStatus === "completed",
        updatedAt: timestamp,
      };

      setState((previous) => ({
        ...previous,
        books: previous.books.map((entry) => (entry.id === existingBook.id ? updated : entry)),
      }));

      if (selectedFile) {
        setFileCache((previous) => ({ ...previous, [existingBook.id]: selectedFile }));
      }
      return;
    }

    const newBook: Book = {
      id: generateId(),
      ...draft,
      status: nextStatus,
      isRead: nextStatus === "completed",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setState((previous) => ({
      ...previous,
      books: [...previous.books, newBook],
    }));

    if (selectedFile) {
      setFileCache((previous) => ({ ...previous, [newBook.id]: selectedFile }));
    }
  };

  const handleToggleRead = (book: Book) => {
    const nextRead = !book.isRead;
    const nextStatus: BookStatus = nextRead
      ? "completed"
      : book.status === "reading"
        ? "reading"
        : "to-read";

    setState((previous) => ({
      ...previous,
      books: previous.books.map((entry) =>
        entry.id === book.id
          ? {
              ...entry,
              isRead: nextRead,
              status: nextStatus,
              updatedAt: nowIso(),
            }
          : entry,
      ),
    }));
  };

  const handleDeleteBook = (book: Book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;

    setState((previous) => ({
      ...previous,
      books: previous.books.filter((entry) => entry.id !== book.id),
    }));
    setFileCache((previous) => {
      const next = { ...previous };
      delete next[book.id];
      return next;
    });
  };

  const handleCreateSeries = (payload: { name: string; description?: string }) => {
    const timestamp = nowIso();
    const newSeries: Series = {
      id: generateId(),
      name: payload.name,
      description: payload.description,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setState((previous) => ({
      ...previous,
      series: [...previous.series, newSeries],
    }));
  };

  const handleDeleteSeries = (series: Series) => {
    if (!window.confirm(`Delete series "${series.name}" and all its books?`)) return;

    setState((previous) => ({
      ...previous,
      series: previous.series.filter((entry) => entry.id !== series.id),
      books: previous.books.filter((book) => book.seriesId !== series.id),
    }));
  };

  const handleOpenReader = (book: Book) => {
    const file = fileCache[book.id];
    if (!file) {
      setNotice(
        `No active file for "${book.title}". Re-attach the local file to open the reader.`,
      );
      return;
    }

    setReaderState({ title: book.title, file });
  };

  const handleAttachFileClick = (book: Book) => {
    setBookToAttachFile(book);
    attachInputRef.current?.click();
  };

  const handleAttachFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file || !bookToAttachFile) return;

    const metadata = {
      name: file.name,
      type: file.type || "application/octet-stream",
      lastAttachedAt: nowIso(),
    };

    setState((previous) => ({
      ...previous,
      books: previous.books.map((entry) =>
        entry.id === bookToAttachFile.id
          ? {
              ...entry,
              file: metadata,
              updatedAt: nowIso(),
            }
          : entry,
      ),
    }));

    setFileCache((previous) => ({ ...previous, [bookToAttachFile.id]: file }));
    setNotice(`Attached ${file.name} to "${bookToAttachFile.title}".`);
    setBookToAttachFile(null);
  };

  const handleImport = async (file: File) => {
    const filename = file.name.toLowerCase();
    const importedState = filename.endsWith(".xlsx")
      ? await importFromXlsx(file)
      : await importFromJsonOrTxt(file);

    if (!window.confirm("Replace current data with imported data? This cannot be undone.")) {
      return;
    }

    setState(importedState);
    setFileCache({});
    setNotice("Import complete. Re-attach local files to use reader after reload.");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30">
        <h1 className="font-serif text-2xl font-semibold text-slate-100 sm:text-3xl">
          Reading Order Tracker
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Track series, organize reading order, and keep reading progress in sync.
        </p>
      </header>

      <input
        ref={attachInputRef}
        type="file"
        accept=".epub,.pdf,.txt,.md"
        className="hidden"
        onChange={handleAttachFileChange}
      />

      <nav className="grid gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setViewMode("series")}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            viewMode === "series"
              ? "bg-violet-800 text-violet-100"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <LibraryBig size={16} /> Series view
        </button>
        <button
          type="button"
          onClick={() => setViewMode("all")}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            viewMode === "all"
              ? "bg-violet-800 text-violet-100"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <BookPlus size={16} /> All books
        </button>
        <button
          type="button"
          onClick={() => setViewMode("dashboard")}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            viewMode === "dashboard"
              ? "bg-violet-800 text-violet-100"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          <ChartNoAxesCombined size={16} /> Dashboard
        </button>
      </nav>

      {state.series.length > 0 ? (
        <FilterBar
          query={query}
          status={statusFilter}
          author={authorFilter}
          sortMode={sortMode}
          authors={authors}
          onChange={(next) => {
            if (next.query !== undefined) setQuery(next.query);
            if (next.status !== undefined) setStatusFilter(next.status);
            if (next.author !== undefined) setAuthorFilter(next.author);
            if (next.sortMode !== undefined) setSortMode(next.sortMode);
          }}
        />
      ) : null}

      <ImportExportControls
        onExportJson={() => downloadJson(state)}
        onExportTxt={() => downloadTxt(state)}
        onExportXlsx={() => downloadXlsx(state)}
        onImport={handleImport}
      />

      {notice ? (
        <p className="rounded-lg border border-violet-800/50 bg-violet-950/40 px-3 py-2 text-sm text-violet-200">
          {notice}
        </p>
      ) : null}

      {viewMode === "series" ? (
        <SeriesManager
          series={state.series}
          books={state.books}
          onCreateSeries={handleCreateSeries}
          onEditSeries={setEditingSeries}
          onDeleteSeries={handleDeleteSeries}
          onAddBook={(seriesId) => {
            setEditingBook(undefined);
            setBookFormSeriesId(seriesId);
          }}
          onEditBook={(book) => {
            setEditingBook(book);
            setBookFormSeriesId(undefined);
          }}
          onDeleteBook={handleDeleteBook}
          onToggleRead={handleToggleRead}
          onOpenReader={handleOpenReader}
          onAttachFile={handleAttachFileClick}
        />
      ) : null}

      {viewMode === "all" ? (
        <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-100">All books</h2>
            <button
              type="button"
              onClick={() => {
                setEditingBook(undefined);
                setBookFormSeriesId(state.series[0]?.id);
              }}
              disabled={state.series.length === 0}
              className="rounded-lg bg-violet-700 px-3 py-1.5 text-sm text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add book
            </button>
          </div>
          <BookList
            books={filteredBooks}
            seriesMap={seriesMap}
            onEdit={(book) => {
              setEditingBook(book);
              setBookFormSeriesId(undefined);
            }}
            onDelete={handleDeleteBook}
            onToggleRead={handleToggleRead}
            onOpenReader={handleOpenReader}
            onAttachFile={handleAttachFileClick}
          />
        </section>
      ) : null}

      {viewMode === "dashboard" ? <Dashboard books={filteredBooks} seriesMap={seriesMap} /> : null}

      {(editingBook !== undefined || bookFormSeriesId !== undefined) && state.series.length > 0 ? (
        <BookForm
          series={state.series}
          initialBook={editingBook}
          selectedSeriesId={bookFormSeriesId}
          onSubmit={(draft, selectedFile) => {
            applyBookDraft(draft, selectedFile, editingBook);
            setEditingBook(undefined);
            setBookFormSeriesId(undefined);
          }}
          onCancel={() => {
            setEditingBook(undefined);
            setBookFormSeriesId(undefined);
          }}
        />
      ) : null}

      {editingSeries ? (
        <section className="rounded-xl border border-slate-700 bg-slate-900/90 p-4">
          <h3 className="text-lg font-semibold text-slate-100">Edit series</h3>
          <form
            className="mt-3 grid gap-3 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!editingSeries.name.trim()) return;

              setState((previous) => ({
                ...previous,
                series: previous.series.map((entry) =>
                  entry.id === editingSeries.id
                    ? { ...editingSeries, updatedAt: nowIso() }
                    : entry,
                ),
              }));
              setEditingSeries(undefined);
            }}
          >
            <label className="grid gap-1 text-sm">
              <span className="text-slate-300">Series name</span>
              <input
                value={editingSeries.name}
                onChange={(event) =>
                  setEditingSeries((previous) =>
                    previous ? { ...previous, name: event.target.value } : previous,
                  )
                }
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-slate-300">Description</span>
              <input
                value={editingSeries.description ?? ""}
                onChange={(event) =>
                  setEditingSeries((previous) =>
                    previous
                      ? {
                          ...previous,
                          description: event.target.value || undefined,
                        }
                      : previous,
                  )
                }
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
              />
            </label>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSeries(undefined)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-violet-700 px-3 py-1.5 text-sm text-white transition hover:bg-violet-600"
              >
                Save series
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {readerState ? (
        <EpubReaderModal
          title={readerState.title}
          file={readerState.file}
          onClose={() => setReaderState(null)}
        />
      ) : null}
    </div>
  );
}
