import { EnvironmentId, ThreadId } from "@t3tools/contracts";
import { describe, expect, it, vi } from "vite-plus/test";

import {
  buildDetachedProjectUrl,
  buildDetachedThreadUrl,
  isScreenPointOutsideWindow,
  openDetachedWindow,
  readDetachedProjectScope,
} from "./detachedWindow";

describe("detachedWindow", () => {
  const threadRef = {
    environmentId: EnvironmentId.make("local env"),
    threadId: ThreadId.make("thread/1"),
  };

  it("builds a scoped URL for an exact thread", () => {
    const url = new URL(
      buildDetachedThreadUrl({
        baseUrl: "t3code://app/current",
        threadRef,
        projectScopeKey: "logical/project",
      }),
    );

    expect(url.pathname).toBe("/local%20env/thread%2F1");
    expect(url.searchParams.get("t3Detached")).toBe("1");
    expect(url.searchParams.get("t3ProjectScope")).toBe("logical/project");
    expect(url.searchParams.get("t3WindowId")).toMatch(/^[0-9a-f-]{36}$/u);
    expect(readDetachedProjectScope(url.toString())).toBe("logical/project");
  });

  it("falls back to project settings when a project has no thread", () => {
    const url = new URL(
      buildDetachedProjectUrl({
        baseUrl: "t3code://app/",
        projectScopeKey: "empty project",
        threadRef: null,
      }),
    );

    expect(url.pathname).toBe("/projects/empty%20project");
    expect(readDetachedProjectScope(url.toString())).toBe("empty project");
  });

  it("only treats points beyond the native window bounds as outside", () => {
    const bounds = { x: 100, y: 50, width: 900, height: 700 };
    expect(isScreenPointOutsideWindow({ x: 100, y: 50 }, bounds)).toBe(false);
    expect(isScreenPointOutsideWindow({ x: 999, y: 749 }, bounds)).toBe(false);
    expect(isScreenPointOutsideWindow({ x: 1_000, y: 749 }, bounds)).toBe(true);
    expect(isScreenPointOutsideWindow({ x: 99, y: 300 }, bounds)).toBe(true);
  });

  it("opens the detached window at the drop point with safe child features", () => {
    const open = vi.fn(() => null);
    openDetachedWindow({
      url: "t3code://app/env/thread?t3Detached=1",
      point: { x: 700, y: 320 },
      sourceWindow: { open, outerWidth: 1_200, outerHeight: 800 } as never,
    });

    expect(open).toHaveBeenCalledWith(
      "t3code://app/env/thread?t3Detached=1",
      "_blank",
      "noopener,noreferrer,left=652,top=296,width=1200,height=800",
    );
  });
});
