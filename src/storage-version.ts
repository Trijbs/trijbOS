export const STORAGE_SCHEMA_VERSION = "1";

export type StorageBootstrapAction =
  | { type: "seed" }
  | { type: "noop" }
  | { type: "migrate"; from: string; to: string }
  | { type: "reset"; from: string; to: string };

export function getStorageBootstrapAction(
  storedVersion: string | undefined | null,
): StorageBootstrapAction {
  if (!storedVersion) {
    return { type: "seed" };
  }

  if (storedVersion === STORAGE_SCHEMA_VERSION) {
    return { type: "noop" };
  }

  if (storedVersion === "0" && STORAGE_SCHEMA_VERSION === "1") {
    return { type: "migrate", from: storedVersion, to: STORAGE_SCHEMA_VERSION };
  }

  return { type: "reset", from: storedVersion, to: STORAGE_SCHEMA_VERSION };
}
