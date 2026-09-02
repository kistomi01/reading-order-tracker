import { Clock3, Library, ListTodo } from "lucide-react";

import { Book, Series } from "@/lib/types";

interface DashboardProps {
  books: Book[];
  seriesMap: Map<string, Series>;
}

export function Dashboard({ books, seriesMap }: DashboardProps) {
  const toRead = books.filter((book) => book.status === "to-read");
  const reading = books.filter((book) => book.status === "reading");
  const completed = books.filter((book) => book.status === "completed");
  const queue = [...toRead, ...reading];

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Library size={16} /> Total books
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{books.length}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center gap-2 text-slate-300">
            <ListTodo size={16} /> To Read
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{toRead.length}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock3 size={16} /> Reading now
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{reading.length}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Library size={16} /> Completed
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{completed.length}</p>
        </article>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-lg font-semibold text-slate-100">Upcoming reading queue</h2>
        <div className="mt-3 space-y-2">
          {queue.length === 0 ? (
            <p className="text-sm text-slate-400">No upcoming books. Add more books to plan your queue.</p>
          ) : (
            queue.map((book, index) => (
              <div
                key={book.id}
                className="flex flex-wrap items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-100">
                    {index + 1}. {book.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {book.author} · {seriesMap.get(book.seriesId)?.name ?? "Unknown series"}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {book.status === "reading" ? "Currently reading" : "Queued"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
