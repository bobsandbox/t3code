import { describe, expect, it } from "vite-plus/test";

import {
  PROJECT_COLOR_COUNT,
  projectColorIndex,
  projectColorStyle,
  projectColorVar,
} from "./projectColor";

describe("projectColorIndex", () => {
  it("stays inside the palette", () => {
    for (const name of ["sbxs-infra", "t3code", "a", "", "  ", "x".repeat(200)]) {
      const index = projectColorIndex(name);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(PROJECT_COLOR_COUNT);
      expect(Number.isInteger(index)).toBe(true);
    }
  });

  it("is stable for the same name and ignores case and surrounding space", () => {
    expect(projectColorIndex("sbxs-infra")).toBe(projectColorIndex("sbxs-infra"));
    expect(projectColorIndex("  SBXS-Infra ")).toBe(projectColorIndex("sbxs-infra"));
  });

  it("spreads a realistic project list over most of the palette", () => {
    const names = [
      "sbxs-infra",
      "t3code",
      "focor",
      "bookyourbox",
      "lunartap",
      "mailroom",
      "heft",
      "avrenting",
      "my-energy",
      "tradebot",
      "hermanos",
      "twinstone",
    ];
    const used = new Set(names.map(projectColorIndex));
    // Collisions are expected in a closed palette; a hash that funnels a dozen
    // names into two or three colours is not.
    expect(used.size).toBeGreaterThanOrEqual(7);
  });
});

describe("projectColorVar", () => {
  it("points at a palette variable", () => {
    expect(projectColorVar("t3code")).toBe(
      `var(--project-color-${String(projectColorIndex("t3code"))})`,
    );
  });
});

describe("projectColorStyle", () => {
  it("exposes the colour as a custom property", () => {
    expect(projectColorStyle("t3code")).toEqual({ "--project-color": projectColorVar("t3code") });
  });

  it("returns nothing without a usable name, so callers keep their fallback", () => {
    expect(projectColorStyle(null)).toBeUndefined();
    expect(projectColorStyle(undefined)).toBeUndefined();
    expect(projectColorStyle("   ")).toBeUndefined();
  });
});
