export class SecurityPolicy {
  public static readonly FAIL_CLOSED_THRESHOLD = 0.70;

  public static isActionAllowed(sensitivity: string, confidence: number): boolean {
    if (confidence < SecurityPolicy.FAIL_CLOSED_THRESHOLD) {
      // Fail closed rule: treat low confidence as sensitive & block automatic execution
      return false;
    }

    if (sensitivity === 'CREDENTIAL' || sensitivity === 'FINANCIAL') {
      return false; // Requires explicit auth & user confirmation
    }

    return true;
  }
}
