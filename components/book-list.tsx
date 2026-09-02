import { Book, Series } from "@/lib/types";
import { BookOpen, CheckCircle2, Paperclip, Pencil, Trash2 } from "lucide-react";

interface BookListProps {
  books: Book[];
  seriesMap: Map<string, Series>;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onToggleRead: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onAttachFile: (book: Book) => void;
}

const statusClass: Record<Book["status"], string> = {
  "to-read": "bg-slate-800 text-slate-300 border-slate-700",
  reading: "bg-violet-900/50 text-violet-300 border-violet-700",
  completed: "bg-emerald-900/50 text-emerald-300 border-emerald-700",
};

const statusLabel: Record<Book["status"], string> = {
  "to-read": "To Read",
  reading: "Reading",
  completed: "Completed",
};

export function BookList({
  books,
  seriesMap,
  onEdit,
  onDelete,
  onToggleRead,
  onOpenReader,
  onAttachFile,
}: BookListProps) {
  if (books.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center text-slate-400">
        No books yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:hidden">
        {books.map((book) => (
          <article
            key={book.id}
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-slate-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100">{book.title}</h3>
                <p className="text-sm text-slate-400">{book.author}</p>
                <p className="text-xs text-slate-500">
                  {seriesMap.get(book.seriesId)?.name ?? "Unknown series"}
                </p>
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClass[book.status]}`}>
                {statusLabel[book.status]}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Release: {book.releaseOrder ?? "—"}</span>
              <span>Chronological: {book.chronologicalOrder ?? "—"}</span>
              {book.file ? (
                <span className="inline-flex items-center gap-1 text-slate-300">
                  <Paperclip size={12} /> {book.file.name}
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onToggleRead(book)}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition ${
                  book.isRead
                    ? "bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                <CheckCircle2 size={16} /> {book.isRead ? "Read" : "Mark read"}
              </button>
              <button
                type="button"
                onClick={() => onOpenReader(book)}
                className="inline-flex items-center gap-1 rounded-lg bg-violet-900/60 px-3 py-1.5 text-sm text-violet-100 transition hover:bg-violet-800"
              >
                <BookOpen size={16} /> Read
              </button>
              <button
                type="button"
                onClick={() => onAttachFile(book)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-100 transition hover:bg-slate-700"
              >
                <Paperclip size={16} /> File
              </button>
              <button
                type="button"
                onClick={() => onEdit(book)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-100 transition hover:bg-slate-700"
              >
                <Pencil size={16} /> Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(book)}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-900/40 px-3 py-1.5 text-sm text-rose-200 transition hover:bg-rose-800"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-800 lg:block">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Title</th>
              <th className="px-3 py-2 text-left font-medium">Author</th>
              <th className="px-3 py-2 text-left font-medium">Series</th>
              <th className="px-3 py-2 text-left font-medium">Release</th>
              <th className="px-3 py-2 text-left font-medium">Chronological</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/70">
            {books.map((book) => (
              <tr key={book.id} className="transition hover:bg-slate-900/70">
                <td className="px-3 py-2 text-slate-100">
                  <div className="font-medium">{book.title}</div>
                  {book.file ? (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
                      <Paperclip size={12} /> {book.file.name}
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-slate-300">{book.author}</td>
                <td className="px-3 py-2 text-slate-400">
                  {seriesMap.get(book.seriesId)?.name ?? "Unknown series"}
                </td>
                <td className="px-3 py-2 text-slate-300">{book.releaseOrder ?? "—"}</td>
                <td className="px-3 py-2 text-slate-300">{book.chronologicalOrder ?? "—"}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${statusClass[book.status]}`}>
                    {statusLabel[book.status]}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleRead(book)}
                      className={`rounded-md px-2 py-1 text-xs transition ${
                        book.isRead
                          ? "bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800"
                          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      {book.isRead ? "Read" : "Mark read"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenReader(book)}
                      className="rounded-md bg-violet-900/60 px-2 py-1 text-xs text-violet-100 transition hover:bg-violet-800"
                    >
                      Read
                    </button>
                    <button
                      type="button"
                      onClick={() => onAttachFile(book)}
                      className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-100 transition hover:bg-slate-700"
                    >
                      File
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(book)}
                      className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-100 transition hover:bg-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(book)}
                      className="rounded-md bg-rose-900/40 px-2 py-1 text-xs text-rose-200 transition hover:bg-rose-800"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
