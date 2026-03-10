import { describe, expect, it } from "vitest";
import {
  dismissShellOverlays,
  toggleLauncherState,
  toggleNotificationsState,
} from "./shell-state";

describe("shell overlay state", () => {
  it("opens the launcher and closes notifications", () => {
    expect(
      toggleLauncherState({
        launcherOpen: false,
        notificationsOpen: true,
      }),
    ).toEqual({
      launcherOpen: true,
      notificationsOpen: false,
    });
  });

  it("can close the launcher without reopening notifications", () => {
    expect(
      toggleLauncherState({
        launcherOpen: true,
        notificationsOpen: false,
      }),
    ).toEqual({
      launcherOpen: false,
      notificationsOpen: false,
    });
  });

  it("opens notifications and closes the launcher", () => {
    expect(
      toggleNotificationsState({
        launcherOpen: true,
        notificationsOpen: false,
      }),
    ).toEqual({
      launcherOpen: false,
      notificationsOpen: true,
    });
  });

  it("dismisses all overlays together", () => {
    expect(dismissShellOverlays()).toEqual({
      launcherOpen: false,
      notificationsOpen: false,
    });
  });
});
