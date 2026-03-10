import { describe, expect, it } from "vitest";
import { getStorageBootstrapAction, STORAGE_SCHEMA_VERSION } from "./storage-version";

describe("storage version", () => {
  it("seeds when no schema version exists yet", () => {
    expect(getStorageBootstrapAction(undefined)).toEqual({ type: "seed" });
    expect(getStorageBootstrapAction(null)).toEqual({ type: "seed" });
  });

  it("noops when the schema matches", () => {
    expect(getStorageBootstrapAction(STORAGE_SCHEMA_VERSION)).toEqual({ type: "noop" });
  });

  it("migrates known legacy versions", () => {
    expect(getStorageBootstrapAction("0")).toEqual({
      type: "migrate",
      from: "0",
      to: STORAGE_SCHEMA_VERSION,
    });
  });

  it("resets unknown mismatched schema versions", () => {
    expect(getStorageBootstrapAction("2")).toEqual({
      type: "reset",
      from: "2",
      to: STORAGE_SCHEMA_VERSION,
    });
  });
});
