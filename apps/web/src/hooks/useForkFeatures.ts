import { useCallback, useMemo } from "react";

import {
  DisabledForkFeaturesSchema,
  FORK_FEATURES_STORAGE_KEY,
  type ForkFeatureFlags,
  type ForkFeatureId,
  resolveForkFeatureFlags,
  toggleForkFeature,
} from "../forkFeatures";
import { useLocalStorage } from "./useLocalStorage";

const NOTHING_DISABLED: ReadonlyArray<string> = [];

/** Reads the whole set. Components that gate a single feature should use
    useForkFeature instead, so a change to an unrelated flag cannot re-render
    them for nothing. */
export function useForkFeatureFlags(): {
  readonly flags: ForkFeatureFlags;
  readonly setFeature: (id: ForkFeatureId, enabled: boolean) => void;
} {
  const [disabledIds, setDisabledIds] = useLocalStorage(
    FORK_FEATURES_STORAGE_KEY,
    NOTHING_DISABLED,
    DisabledForkFeaturesSchema,
  );
  const flags = useMemo(() => resolveForkFeatureFlags(disabledIds), [disabledIds]);
  const setFeature = useCallback(
    (id: ForkFeatureId, enabled: boolean) => {
      setDisabledIds((current) => toggleForkFeature(current, id, enabled));
    },
    [setDisabledIds],
  );
  return { flags, setFeature };
}

export function useForkFeature(id: ForkFeatureId): boolean {
  return useForkFeatureFlags().flags[id];
}
