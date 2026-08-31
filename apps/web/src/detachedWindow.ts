import type { ScopedThreadRef } from "@t3tools/contracts";

import { randomUUID } from "./lib/utils";

export const DETACHED_WINDOW_SEARCH_PARAM = "t3Detached";
export const DETACHED_PROJECT_SCOPE_SEARCH_PARAM = "t3ProjectScope";
export const DETACHED_WINDOW_ID_SEARCH_PARAM = "t3WindowId";

export interface ScreenPoint {
  readonly x: number;
  readonly y: number;
}

export interface AppWindowBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function isScreenPointOutsideWindow(point: ScreenPoint, bounds: AppWindowBounds): boolean {
  return (
    point.x < bounds.x ||
    point.y < bounds.y ||
    point.x >= bounds.x + bounds.width ||
    point.y >= bounds.y + bounds.height
  );
}

export function readDetachedProjectScope(locationUrl: string): string | null {
  try {
    const url = new URL(locationUrl);
    if (url.searchParams.get(DETACHED_WINDOW_SEARCH_PARAM) !== "1") return null;
    const projectScope = url.searchParams.get(DETACHED_PROJECT_SCOPE_SEARCH_PARAM)?.trim();
    return projectScope ? projectScope : null;
  } catch {
    return null;
  }
}

function buildDetachedUrl(input: {
  readonly baseUrl: string;
  readonly pathname: string;
  readonly projectScopeKey: string;
}): string {
  const url = new URL(input.pathname, input.baseUrl);
  url.searchParams.set(DETACHED_WINDOW_SEARCH_PARAM, "1");
  url.searchParams.set(DETACHED_PROJECT_SCOPE_SEARCH_PARAM, input.projectScopeKey);
  url.searchParams.set(DETACHED_WINDOW_ID_SEARCH_PARAM, randomUUID());
  return url.toString();
}

export function buildDetachedThreadUrl(input: {
  readonly baseUrl: string;
  readonly threadRef: ScopedThreadRef;
  readonly projectScopeKey: string;
}): string {
  return buildDetachedUrl({
    baseUrl: input.baseUrl,
    pathname: `/${encodeURIComponent(input.threadRef.environmentId)}/${encodeURIComponent(input.threadRef.threadId)}`,
    projectScopeKey: input.projectScopeKey,
  });
}

export function buildDetachedProjectUrl(input: {
  readonly baseUrl: string;
  readonly projectScopeKey: string;
  readonly threadRef: ScopedThreadRef | null;
}): string {
  if (input.threadRef !== null) {
    return buildDetachedThreadUrl({
      baseUrl: input.baseUrl,
      threadRef: input.threadRef,
      projectScopeKey: input.projectScopeKey,
    });
  }
  return buildDetachedUrl({
    baseUrl: input.baseUrl,
    pathname: `/projects/${encodeURIComponent(input.projectScopeKey)}`,
    projectScopeKey: input.projectScopeKey,
  });
}

export function openDetachedWindow(input: {
  readonly url: string;
  readonly point: ScreenPoint;
  readonly sourceWindow: Pick<Window, "open" | "outerHeight" | "outerWidth">;
}): Window | null {
  const width = Math.max(840, Math.round(input.sourceWindow.outerWidth));
  const height = Math.max(620, Math.round(input.sourceWindow.outerHeight));
  const left = Math.round(input.point.x - 48);
  const top = Math.round(input.point.y - 24);
  const features = [
    "noopener",
    "noreferrer",
    `left=${String(left)}`,
    `top=${String(top)}`,
    `width=${String(width)}`,
    `height=${String(height)}`,
  ].join(",");
  return input.sourceWindow.open(input.url, "_blank", features);
}
