export interface InjectionScanResult {
  isMalicious: boolean;
  detectedThreats: string[];
  sanitizedInstruction: string;
}

export class PromptInjectionDefense {
  private static INJECTION_PATTERNS = [
    /ignore\s+all\s+(previous|prior)\s+instructions/gi,
    /system\s*:\s*override/gi,
    /send\s+(password|pii|credentials|data)\s+to/gi,
    /bypass\s+security\s+filter/gi,
    /disregard\s+safety\s+rules/gi,
    /eval\s*\(|document\.cookie|fetch\s*\(/gi
  ];

  public static scanWebpageText(webpageText: string): InjectionScanResult {
    const threats: string[] = [];
    let isMalicious = false;

    for (const pattern of PromptInjectionDefense.INJECTION_PATTERNS) {
      if (pattern.test(webpageText)) {
        isMalicious = true;
        threats.push(`Prompt Injection Pattern Detected: "${pattern.source}"`);
      }
    }

    return {
      isMalicious,
      detectedThreats: threats,
      sanitizedInstruction: webpageText.replace(/(ignore|override|bypass).*$/gi, '[BLOCKED_INJECTION_TEXT]')
    };
  }
}
