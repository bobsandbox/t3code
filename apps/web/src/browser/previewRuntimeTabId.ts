import type { ScopedThreadRef } from "@t3tools/contracts";

const PREVIEW_RENDERER_WINDOW_ID_STORAGE_KEY = "t3code:preview-renderer-window-id";

export function resolvePreviewRendererWindowId(input: {
  readonly locationUrl: string | null;
  readonly persistedWindowId: string | null;
}): string {
  if (input.persistedWindowId?.trim()) return input.persistedWindowId;
  if (input.locationUrl !== null) {
    try {
      const detachedWindowId = new URL(input.locationUrl).searchParams.get("t3WindowId")?.trim();
      if (detachedWindowId) return detachedWindowId;
    } catch {
      // A malformed location cannot be a detached renderer URL.
    }
  }
  return "main";
}

const previewRendererWindowId = (() => {
  if (typeof window === "undefined") return "main";
  let persistedWindowId: string | null = null;
  try {
    persistedWindowId = window.sessionStorage.getItem(PREVIEW_RENDERER_WINDOW_ID_STORAGE_KEY);
  } catch {
    // Keep working when storage is disabled.
  }
  const windowId = resolvePreviewRendererWindowId({
    locationUrl: window.location.href,
    persistedWindowId,
  });
  try {
    window.sessionStorage.setItem(PREVIEW_RENDERER_WINDOW_ID_STORAGE_KEY, windowId);
  } catch {
    // The URL still keeps detached windows isolated for this page lifetime.
  }
  return windowId;
})();

/**
 * The server only guarantees preview tab ids are unique within one process.
 * Desktop resources live across every connected environment, so they need a
 * stronger identity that also changes when a server process restarts.
 */
export function previewRuntimeTabId(
  threadRef: ScopedThreadRef,
  serverEpoch: string | null,
  tabId: string,
): string {
  return JSON.stringify([
    previewRendererWindowId,
    threadRef.environmentId,
    threadRef.threadId,
    serverEpoch,
    tabId,
  ]);
}

export function isCurrentPreviewRuntimeTab(
  threadRef: ScopedThreadRef,
  serverEpoch: string | null,
  tabId: string,
  runtimeTabId: string,
): boolean {
  return previewRuntimeTabId(threadRef, serverEpoch, tabId) === runtimeTabId;
}
