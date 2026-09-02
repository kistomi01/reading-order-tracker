import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface EpubReaderModalProps {
  title: string;
  file: File;
  onClose: () => void;
}

type ReaderTheme = "dark" | "sepia" | "light";
type EpubLocation = { start?: { percentage?: number } };

interface EpubThemes {
  register(name: string, rules: Record<string, unknown>): void;
  default(rules: Record<string, unknown>): void;
  select(name: string): void;
}

interface EpubRendition {
  themes: EpubThemes;
  on(eventName: "relocated", handler: (location: EpubLocation) => void): void;
  display(): Promise<void>;
  next(): void;
  prev(): void;
  destroy?(): void;
}

interface EpubBookInstance {
  renderTo(
    element: HTMLElement,
    options: { width: string; height: string; flow: "paginated" },
  ): EpubRendition;
  destroy?(): void;
}

type EpubFactory = (input: string) => EpubBookInstance;

const themes: Record<ReaderTheme, { body: string; text: string }> = {
  dark: { body: "#0b1020", text: "#e2e8f0" },
  sepia: { body: "#2d241a", text: "#f5e6c8" },
  light: { body: "#f8fafc", text: "#0f172a" },
};

export function EpubReaderModal({ title, file, onClose }: EpubReaderModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renditionRef = useRef<EpubRendition | null>(null);
  const bookRef = useRef<EpubBookInstance | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const [fontFamily, setFontFamily] = useState("Lora");
  const [fontSize, setFontSize] = useState(100);
  const [lineHeight, setLineHeight] = useState(1.65);
  const [theme, setTheme] = useState<ReaderTheme>("dark");

  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    let isMounted = true;

    const initReader = async () => {
      try {
        const epubModule = await import("@likecoin/epub-ts");
        const ePubFactory = epubModule.default as EpubFactory;

        if (!containerRef.current) return;

        const book = ePubFactory(objectUrl);
        const rendition = book.renderTo(containerRef.current, {
          width: "100%",
          height: "100%",
          flow: "paginated",
        });

        bookRef.current = book;
        renditionRef.current = rendition;

        rendition.themes.register("dark", {
          body: {
            background: themes.dark.body,
            color: themes.dark.text,
          },
        });
        rendition.themes.register("sepia", {
          body: {
            background: themes.sepia.body,
            color: themes.sepia.text,
          },
        });
        rendition.themes.register("light", {
          body: {
            background: themes.light.body,
            color: themes.light.text,
          },
        });

        rendition.on("relocated", (location: EpubLocation) => {
          const percentage = location?.start?.percentage;
          if (typeof percentage === "number") {
            setProgress(Math.round(percentage * 100));
          }
        });

        await rendition.display();
      } catch {
        if (isMounted) {
          setError("Unable to open this EPUB file.");
        }
      }
    };

    void initReader();

    return () => {
      isMounted = false;
      try {
        renditionRef.current?.destroy?.();
      } catch {
        // noop
      }
      try {
        bookRef.current?.destroy?.();
      } catch {
        // noop
      }
      URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    const rendition = renditionRef.current;
    if (!rendition) return;

    rendition.themes.default({
      body: {
        "font-family": `'${fontFamily}', serif`,
        "font-size": `${fontSize}%`,
        "line-height": lineHeight.toString(),
      },
    });
    rendition.themes.select(theme);
  }, [fontFamily, fontSize, lineHeight, theme]);

  const goNext = () => renditionRef.current?.next?.();
  const goPrev = () => renditionRef.current?.prev?.();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100">{title}</h2>
          <p className="text-xs text-slate-400">
            File access is session-based; reselect may be required after refresh.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-700 p-2 text-slate-200 transition hover:border-slate-500"
          aria-label="Close reader"
        >
          <X size={16} />
        </button>
      </header>

      <section className="grid gap-3 border-b border-slate-800 px-4 py-3 md:grid-cols-6">
        <label className="grid gap-1 text-xs text-slate-300">
          Font
          <select
            value={fontFamily}
            onChange={(event) => setFontFamily(event.target.value)}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus:border-violet-500 focus:outline-none"
          >
            <option value="Lora">Lora</option>
            <option value="Inter">Inter</option>
            <option value="Georgia">Georgia</option>
            <option value="serif">Serif</option>
          </select>
        </label>

        <label className="grid gap-1 text-xs text-slate-300">
          Font size
          <input
            type="range"
            min={80}
            max={160}
            value={fontSize}
            onChange={(event) => setFontSize(Number(event.target.value))}
          />
        </label>

        <label className="grid gap-1 text-xs text-slate-300">
          Line height
          <input
            type="range"
            min={1.2}
            max={2}
            step={0.05}
            value={lineHeight}
            onChange={(event) => setLineHeight(Number(event.target.value))}
          />
        </label>

        <label className="grid gap-1 text-xs text-slate-300">
          Theme
          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value as ReaderTheme)}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100 focus:border-violet-500 focus:outline-none"
          >
            <option value="dark">Dark</option>
            <option value="sepia">Sepia</option>
            <option value="light">Light</option>
          </select>
        </label>

        <div className="col-span-2 flex items-end gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500"
          >
            Next <ChevronRight size={16} />
          </button>
          <span className="ml-auto text-xs text-slate-400">Progress: {progress}%</span>
        </div>
      </section>

      <div className="relative flex-1">
        {error ? (
          <div className="absolute inset-0 grid place-items-center p-4 text-center text-rose-300">
            {error}
          </div>
        ) : null}
        <div ref={containerRef} className="h-full w-full" aria-label="EPUB reader viewport" />
      </div>
    </div>
  );
}
