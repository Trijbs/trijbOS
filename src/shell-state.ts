export type ShellOverlayState = {
  launcherOpen: boolean;
  notificationsOpen: boolean;
};

export function toggleLauncherState(state: ShellOverlayState, forced?: boolean): ShellOverlayState {
  const launcherOpen = forced ?? !state.launcherOpen;
  return {
    launcherOpen,
    notificationsOpen: launcherOpen ? false : state.notificationsOpen,
  };
}

export function toggleNotificationsState(state: ShellOverlayState, forced?: boolean): ShellOverlayState {
  return {
    launcherOpen: false,
    notificationsOpen: forced ?? !state.notificationsOpen,
  };
}

export function dismissShellOverlays(): ShellOverlayState {
  return {
    launcherOpen: false,
    notificationsOpen: false,
  };
}
