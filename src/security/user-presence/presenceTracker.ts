export class UserPresenceTracker {
  private static isLocked = false;

  public static setLocked(locked: boolean): void {
    UserPresenceTracker.isLocked = locked;
  }

  public static isSystemLocked(): boolean {
    return UserPresenceTracker.isLocked;
  }
}
