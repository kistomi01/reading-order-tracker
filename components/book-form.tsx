import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import { Book, BookDraft, BOOK_STATUSES, BookStatus, Series } from "@/lib/types";

interface BookFormProps {
  series: Series[];
  initialBook?: Book;
  selectedSeriesId?: string;
  onSubmit: (draft: BookDraft, selectedFile: File | null) => void;
  onCancel: () => void;
}

const statusLabels: Record<BookStatus, string> = {
  "to-read": "To Read",
  reading: "Reading",
  completed: "Completed",
};

export function BookForm({
  series,
  initialBook,
  selectedSeriesId,
  onSubmit,
  onCancel,
}: BookFormProps) {
  const defaultSeriesId = useMemo(() => {
    if (initialBook?.seriesId) return initialBook.seriesId;
    if (selectedSeriesId) return selectedSeriesId;
    return series[0]?.id ?? "";
  }, [initialBook?.seriesId, selectedSeriesId, series]);

  const [seriesId, setSeriesId] = useState(defaultSeriesId);
  const [title, setTitle] = useState(initialBook?.title ?? "");
  const [author, setAuthor] = useState(initialBook?.author ?? "");
  const [releaseOrder, setReleaseOrder] = useState(
    initialBook?.releaseOrder?.toString() ?? "",
  );
  const [chronologicalOrder, setChronologicalOrder] = useState(
    initialBook?.chronologicalOrder?.toString() ?? "",
  );
  const [status, setStatus] = useState<BookStatus>(initialBook?.status ?? "to-read");
  const [notes, setNotes] = useState(initialBook?.notes ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const parseOptionalNumber = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!seriesId || !title.trim() || !author.trim()) {
      return;
    }

    onSubmit(
      {
        seriesId,
        title: title.trim(),
        author: author.trim(),
        releaseOrder: parseOptionalNumber(releaseOrder),
        chronologicalOrder: parseOptionalNumber(chronologicalOrder),
        status,
        notes: notes.trim() || undefined,
        file: selectedFile
          ? {
              name: selectedFile.name,
              type: selectedFile.type,
              lastAttachedAt: new Date().toISOString(),
            }
          : initialBook?.file,
      },
      selectedFile,
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/90 p-4"
    >
      <h3 className="text-lg font-semibold text-slate-100">
        {initialBook ? "Edit book" : "Add book"}
      </h3>

      <label className="grid gap-1 text-sm">
        <span className="text-slate-300">Series</span>
        <select
          value={seriesId}
          onChange={(event) => setSeriesId(event.target.value)}
          required
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
        >
          {series.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Author</span>
          <input
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            required
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Release order</span>
          <input
            value={releaseOrder}
            onChange={(event) => setReleaseOrder(event.target.value)}
            inputMode="numeric"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Chronological order</span>
          <input
            value={chronologicalOrder}
            onChange={(event) => setChronologicalOrder(event.target.value)}
            inputMode="numeric"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as BookStatus)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
          >
            {BOOK_STATUSES.map((entry) => (
              <option key={entry} value={entry}>
                {statusLabels[entry]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        <span className="text-slate-300">Notes</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="text-slate-300">Attach EPUB/book file (optional)</span>
        <input
          type="file"
          accept=".epub,.pdf,.txt,.md"
          onChange={handleFileChange}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 file:mr-3 file:rounded-md file:border-0 file:bg-violet-900/60 file:px-3 file:py-1 file:text-violet-100"
        />
        <span className="text-xs text-slate-500">
          Stored persistently: metadata only. You may need to reselect file after reload.
        </span>
      </label>

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-violet-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-violet-600"
        >
          {initialBook ? "Save changes" : "Create book"}
        </button>
      </div>
    </form>
  );
}
