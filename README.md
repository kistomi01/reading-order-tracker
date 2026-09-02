# Reading Order Tracker

A production-ready Next.js (App Router) + Tailwind CSS app for tracking book series order, reading progress, and optional in-browser EPUB sessions.

## Setup and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Other scripts

```bash
npm run lint
npm run build
npm run start
```

## Feature overview

- **Series management**
  - Create, edit, and delete series.
  - Series view groups books by series and shows completion progress.
- **Book management**
  - Create, edit, and delete books with:
    - title, author
    - release order / chronological order
    - status (`to-read`, `reading`, `completed`)
    - quick read/unread toggle
    - notes
    - optional attached file metadata
- **Dual book views**
  - Series-grouped view
  - All-books view across all series
- **Reading dashboard**
  - Upcoming queue and progress counters
  - Search (title/author)
  - Filter by status/author
  - Sort by release order, chronological order, author, or title
  - Responsive card/table presentation
- **Import/export**
  - Export to `.xlsx`, `.json`, and `.txt`
  - Import from app-exported `.xlsx`, `.json`, or `.txt`
  - Structural validation and clear error messaging
  - Confirm-before-replace safety prompt
- **EPUB/file reading option**
  - Attach local book file metadata to a book
  - Open attached EPUB in an in-browser reader (session-based file access)
  - Reader controls: font family, font size, line height, theme (dark/sepia/light), prev/next navigation, progress indicator

## Data format notes

### App state shape

```ts
{
  version: number,
  series: Series[],
  books: Book[]
}
```

### XLSX export layout

- Worksheet `Series`: `id, name, description, createdAt, updatedAt`
- Worksheet `Books`: `id, seriesId, title, author, releaseOrder, chronologicalOrder, status, isRead, notes, createdAt, updatedAt, fileName, fileType, fileLastAttachedAt`

### JSON/TXT export

JSON payload (pretty-printed) including a tag and timestamp plus full app state.

## EPUB and local file persistence limitations

Browser storage cannot persist native `File` objects. This app persists only lightweight metadata (name/type/attached timestamp) in localStorage.

That means:
- You can read a selected local file immediately in the current session.
- After refresh/reopen, you may need to reselect the file to open it again.
- Imported data restores file metadata, not binary file contents.

## Accessibility and UX

- Semantic form labels
- Keyboard focus-visible styles
- Dark-mode-first palette with responsive layouts and subtle transitions
- Typography optimized with `Inter` + `Lora` via `next/font`
