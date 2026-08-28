import { describe, expect, it } from "vite-plus/test";

import { buildProjectActionMenuItems } from "./projectActionMenu.logic";

describe("buildProjectActionMenuItems", () => {
  it("offers pin on an unpinned project", () => {
    expect(buildProjectActionMenuItems({ isPinned: false })[0]).toMatchObject({
      id: "pin",
      label: "Pin project",
      icon: "pin",
    });
  });

  it("offers unpin on a pinned one, with the same icon language as threads", () => {
    expect(buildProjectActionMenuItems({ isPinned: true })[0]).toMatchObject({
      id: "unpin",
      label: "Unpin project",
      icon: "pin-off",
    });
  });

  it("always ends with project settings behind a separator", () => {
    for (const isPinned of [true, false]) {
      const items = buildProjectActionMenuItems({ isPinned });
      expect(items).toHaveLength(2);
      expect(items[1]).toMatchObject({ id: "settings", separatorBefore: true });
    }
  });
});
