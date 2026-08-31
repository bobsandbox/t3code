import { describe, expect, it } from "vite-plus/test";

import {
  DEFAULT_FORK_FEATURE_FLAGS,
  FORK_FEATURES,
  FORK_FEATURE_IDS,
  resolveForkFeatureFlags,
  toggleForkFeature,
} from "./forkFeatures";

describe("fork feature registry", () => {
  it("describes every id exactly once", () => {
    expect(FORK_FEATURES.map((feature) => feature.id).sort()).toEqual([...FORK_FEATURE_IDS].sort());
    expect(new Set(FORK_FEATURES.map((feature) => feature.id)).size).toBe(FORK_FEATURE_IDS.length);
  });

  it("defaults every feature on", () => {
    expect(Object.values(DEFAULT_FORK_FEATURE_FLAGS).every(Boolean)).toBe(true);
  });
});

describe("resolveForkFeatureFlags", () => {
  it("treats missing storage as everything on", () => {
    expect(resolveForkFeatureFlags(null)).toEqual(DEFAULT_FORK_FEATURE_FLAGS);
  });

  it("keeps a feature the user switched off", () => {
    expect(resolveForkFeatureFlags(["project-colours"])["project-colours"]).toBe(false);
  });

  it("switches on a feature added after the stored list was written", () => {
    const flags = resolveForkFeatureFlags(["project-colours"]);
    for (const id of FORK_FEATURE_IDS) {
      if (id === "project-colours") continue;
      expect(flags[id]).toBe(true);
    }
  });

  it("ignores ids that are no longer features", () => {
    expect(resolveForkFeatureFlags(["removed-feature"])).toEqual(DEFAULT_FORK_FEATURE_FLAGS);
  });
});

describe("toggleForkFeature", () => {
  it("records the change without touching the rest", () => {
    expect(toggleForkFeature(["project-lane"], "project-colours", false)).toEqual([
      "project-lane",
      "project-colours",
    ]);
  });

  it("switching a feature back on drops it from the list", () => {
    expect(toggleForkFeature(["project-lane", "project-colours"], "project-lane", true)).toEqual([
      "project-colours",
    ]);
  });

  it("never lists the same feature twice", () => {
    expect(toggleForkFeature(["project-lane"], "project-lane", false)).toEqual(["project-lane"]);
  });

  it("does not mutate the input", () => {
    const stored = ["project-lane"];
    toggleForkFeature(stored, "project-colours", false);
    expect(stored).toEqual(["project-lane"]);
  });
});
