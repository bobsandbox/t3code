/**
 * Every change this fork makes to T3 Code, behind its own switch.
 *
 * The point is not configurability for its own sake. It is that our features
 * have to be droppable one at a time: to hand one to somebody else, to bisect
 * which of ours broke something after an upstream rebase, and to get back to
 * stock behaviour without reinstalling a different build.
 *
 * Two rules for anything added here:
 *
 * - Off must mean *upstream*, not "our feature, hidden". A flag that leaves our
 *   layout in place while removing its controls is worse than no flag.
 * - Default on. This build exists because we want these; a fresh install should
 *   look like the one we have been using.
 *
 * Storage is localStorage, so flags are per machine for now — the same
 * limitation the pinned projects have, and it lifts the same way: when we run
 * our own server build these move into settings.json and sync everywhere.
 */
import * as Schema from "effect/Schema";

export const FORK_FEATURE_IDS = [
  "dense-thread-rows",
  "project-colours",
  "project-lane",
  "project-pinning",
  "project-status-glyphs",
  "project-search",
  "scoped-new-thread",
  "thread-header-actions",
  "add-project-create-folder",
  "detached-windows",
] as const;

export type ForkFeatureId = (typeof FORK_FEATURE_IDS)[number];

export interface ForkFeatureDescriptor {
  readonly id: ForkFeatureId;
  readonly label: string;
  /** What turning it OFF gets you, since that is the question a switch asks. */
  readonly description: string;
}

export const FORK_FEATURES: ReadonlyArray<ForkFeatureDescriptor> = [
  {
    id: "dense-thread-rows",
    label: "Compact thread rows",
    description:
      "Two lines per thread instead of three, with the project as a small tinted label beside the branch. Off restores the upstream row with its own project header line.",
  },
  {
    id: "project-colours",
    label: "Project colours",
    description:
      "Every project gets a colour derived from its name, out of a fixed twelve-hue palette. Off leaves every folder icon the same muted grey.",
  },
  {
    id: "project-lane",
    label: "Projects lane",
    description:
      "The project picker slides the sidebar aside and opens a list to the left, with its own sort control. Off restores the upstream dropdown.",
  },
  {
    id: "project-pinning",
    label: "Pin projects",
    description:
      "Right-click a project to pin it to the top of the lane, and drag pinned rows to order them.",
  },
  {
    id: "project-status-glyphs",
    label: "Project status",
    description:
      "Running and unread-completed counts on each project row, using the same glyphs the thread rows use.",
  },
  {
    id: "project-search",
    label: "Search finds projects",
    description:
      "Sidebar search matches project names and workspace paths alongside thread titles.",
  },
  {
    id: "scoped-new-thread",
    label: "Project action row",
    description:
      "A row under the picker that acts on the level you are on: New thread in the scoped project, or New project at the top level. Off restores the upstream New project icon beside the picker.",
  },
  {
    id: "thread-header-actions",
    label: "Thread header buttons",
    description:
      "Pin, mark unread and regenerate title as buttons on the open thread. They stay in the thread menu either way.",
  },
  {
    id: "add-project-create-folder",
    label: "Create folder when adding a project",
    description:
      "Typing a folder that does not exist offers to create it, and the parent of a new project becomes the folder the browser opens in next time.",
  },
  {
    id: "detached-windows",
    label: "Detached windows",
    description: "Drag a project or session out of the app window to open it in its own window.",
  },
];

export type ForkFeatureFlags = Readonly<Record<ForkFeatureId, boolean>>;

export const DEFAULT_FORK_FEATURE_FLAGS: ForkFeatureFlags = Object.fromEntries(
  FORK_FEATURE_IDS.map((id) => [id, true]),
) as ForkFeatureFlags;

export const FORK_FEATURES_STORAGE_KEY = "t3code:fork-features:v1";

/** What is stored is the list of features switched OFF, not a map of every
    flag. A feature we add next month is then absent from that list and arrives
    switched on, which is the behaviour we want; a stored map would have it
    missing and therefore off. */
export const DisabledForkFeaturesSchema = Schema.Array(Schema.String);

export function resolveForkFeatureFlags(
  disabledIds: ReadonlyArray<string> | null | undefined,
): ForkFeatureFlags {
  const disabled = new Set(disabledIds ?? []);
  return Object.fromEntries(
    FORK_FEATURE_IDS.map((id) => [id, !disabled.has(id)]),
  ) as ForkFeatureFlags;
}

export function toggleForkFeature(
  disabledIds: ReadonlyArray<string>,
  id: ForkFeatureId,
  enabled: boolean,
): string[] {
  const withoutId = disabledIds.filter((candidate) => candidate !== id);
  return enabled ? withoutId : [...withoutId, id];
}
