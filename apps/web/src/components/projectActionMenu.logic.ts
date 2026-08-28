import type { ContextMenuItem } from "@t3tools/contracts";

/** Ids for the per-project action menu in the sidebar's project lane. */
export type ProjectActionMenuId = "pin" | "unpin" | "settings";

export interface ProjectActionMenuState {
  readonly isPinned: boolean;
}

/**
 * The project lane's right-click menu. Deliberately mirrors
 * buildThreadActionMenuItems: same verbs, same icons, same order, so pinning a
 * project is the same gesture as pinning a thread rather than a second
 * vocabulary the user has to learn.
 */
export function buildProjectActionMenuItems(
  state: ProjectActionMenuState,
): ReadonlyArray<ContextMenuItem<ProjectActionMenuId>> {
  return [
    state.isPinned
      ? { id: "unpin" as const, label: "Unpin project", icon: "pin-off" }
      : { id: "pin" as const, label: "Pin project", icon: "pin" },
    { id: "settings" as const, label: "Project settings", icon: "settings", separatorBefore: true },
  ];
}
