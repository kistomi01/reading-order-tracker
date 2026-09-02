import { Search } from "lucide-react";

import { BookStatus } from "@/lib/types";
import { SortMode } from "@/lib/sort-filter";

interface FilterBarProps {
  query: string;
  status: "all" | BookStatus;
  author: "all" | string;
  sortMode: SortMode;
  authors: string[];
  onChange: (next: {
    query?: string;
    status?: "all" | BookStatus;
    author?: "all" | string;
    sortMode?: SortMode;
  }) => void;
}

export function FilterBar({
  query,
  status,
  author,
  sortMode,
  authors,
  onChange,
}: FilterBarProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Search</span>
          <span className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 text-slate-500" size={16} />
            <input
              value={query}
              onChange={(event) => onChange({ query: event.target.value })}
              placeholder="Title or author"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-8 pr-3 text-slate-100 focus:border-violet-500 focus:outline-none"
            />
          </span>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Status</span>
          <select
            value={status}
            onChange={(event) =>
              onChange({ status: event.target.value as "all" | BookStatus })
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="to-read">To Read</option>
            <option value="reading">Reading</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Author</span>
          <select
            value={author}
            onChange={(event) => onChange({ author: event.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
          >
            <option value="all">All authors</option>
            {authors.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-slate-300">Sort by</span>
          <select
            value={sortMode}
            onChange={(event) => onChange({ sortMode: event.target.value as SortMode })}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-violet-500 focus:outline-none"
          >
            <option value="release">Release order</option>
            <option value="chronological">Chronological order</option>
            <option value="author">Author</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>
    </section>
  );
}
