import { normalizeAppState } from "@/lib/normalize";
import { APP_STATE_VERSION, AppState } from "@/lib/types";

export const STORAGE_KEY = "reading-order-tracker:state";

export const createEmptyState = (): AppState => ({
  version: APP_STATE_VERSION,
  series: [],
  books: [],
});

export const loadState = (): AppState => {
  if (typeof window === "undefined") {
    return createEmptyState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createEmptyState();
    }

    const parsed = JSON.parse(raw) as unknown;
    const normalized = normalizeAppState(parsed);
    return normalized ?? createEmptyState();
  } catch {
    return createEmptyState();
  }
};

export const saveState = (state: AppState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
};
