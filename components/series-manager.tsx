import { FormEvent, useState } from "react";
import { Book, Series } from "@/lib/types";
import { BookList } from "@/components/book-list";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface SeriesManagerProps {
  series: Series[];
  books: Book[];
  onCreateSeries: (payload: { name: string; description?: string }) => void;
  onEditSeries: (series: Series) => void;
  onDeleteSeries: (series: Series) => void;
  onAddBook: (seriesId: string) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
  onToggleRead: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onAttachFile: (book: Book) => void;
}

export function SeriesManager({
  series,
  books,
  onCreateSeries,
  onEditSeries,
  onDeleteSeries,
  onAddBook,
  onEditBook,
  onDeleteBook,
  onToggleRead,
  onOpenReader,
  onAttachFile,
}: SeriesManagerProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    onCreateSeries({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setName("");
    setDescription("");
  };

  return (
    <section className="space-y-4">
      <form
        onSubmit={handleCreate}
        className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4"
      >
        <h2 className="text-lg font-semibold text-slate-100">Create series</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-slate-300">Series name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-300">Description (optional)</span>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
            />
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-600"
          >
            <Plus size={16} /> Add series
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {series.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center text-slate-400">
            No series yet. Create one to start your checklist.
          </div>
        ) : null}

        {series.map((entry) => {
          const seriesBooks = books.filter((book) => book.seriesId === entry.id);
          const completedCount = seriesBooks.filter((book) => book.status === "completed").length;

          return (
            <article key={entry.id} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-100">{entry.name}</h3>
                  {entry.description ? (
                    <p className="text-sm text-slate-400">{entry.description}</p>
                  ) : null}
                  <p className="text-xs text-slate-500">
                    Progress: {completedCount}/{seriesBooks.length} completed
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onAddBook(entry.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-violet-900/60 px-3 py-1.5 text-sm text-violet-100 transition hover:bg-violet-800"
                  >
                    <Plus size={16} /> Book
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditSeries(entry)}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-100 transition hover:bg-slate-700"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSeries(entry)}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-900/40 px-3 py-1.5 text-sm text-rose-200 transition hover:bg-rose-800"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </header>

              <BookList
                books={seriesBooks}
                seriesMap={new Map([[entry.id, entry]])}
                onEdit={onEditBook}
                onDelete={onDeleteBook}
                onToggleRead={onToggleRead}
                onOpenReader={onOpenReader}
                onAttachFile={onAttachFile}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
