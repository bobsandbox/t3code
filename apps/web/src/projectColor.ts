/**
 * A per-project colour, derived from the project's own name.
 *
 * The sidebar needs a project cue that survives being made denser: at two lines
 * per row there is no space for a full project header, but a tinted folder and
 * a small label still say "this thread belongs over there" at a glance.
 *
 * Two constraints shape this:
 *
 * - No configuration. The colour is a pure function of the name, so a project
 *   keeps its colour across machines, environments and reinstalls, and nobody
 *   has to pick one.
 * - A closed palette. Hashing straight to a hue gives every project its own
 *   almost-colour and the sidebar turns into confetti. Twelve well-separated
 *   hues collide sometimes, and that is the better trade.
 *
 * Lightness and chroma live in `index.css` (`--project-tint-l` / `-c`) and are
 * overridden for dark mode, so one index resolves to a colour that reads on
 * either appearance without any JS branching on the theme.
 */
import type { CSSProperties } from "react";

export const PROJECT_COLOR_COUNT = 12;

/**
 * FNV-1a (32-bit). Chosen for being tiny, dependency-free and well spread over
 * short lowercase strings — project names are typically 4-20 characters, where
 * cheaper hashes (charCode sums, length-weighted mixes) cluster badly.
 *
 * `Math.imul` keeps the multiply in 32-bit space; a plain `*` would silently
 * lose precision past 2^53 and make the result platform-dependent.
 */
export function projectColorIndex(name: string): number {
  const normalized = name.trim().toLowerCase();
  let hash = 0x811c9dc5;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash % PROJECT_COLOR_COUNT;
}

export function projectColorVar(name: string): string {
  return `var(--project-color-${String(projectColorIndex(name))})`;
}

/**
 * Inline style exposing the project's colour as `--project-color`, so callers
 * can consume it from any descendant (`text-[color:var(--project-color)]`)
 * instead of threading a class name through. Returns undefined for a missing or
 * blank name; consumers then fall back through the var's own default.
 */
export function projectColorStyle(name: string | null | undefined): CSSProperties | undefined {
  const trimmed = name?.trim();
  if (trimmed === undefined || trimmed === "") return undefined;
  return { "--project-color": projectColorVar(trimmed) } as CSSProperties;
}
