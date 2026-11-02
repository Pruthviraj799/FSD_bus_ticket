import { DetectedPII } from '../../types';

export class PiiDetector {
  private static PII_PATTERNS = [
    {
      type: 'EMAIL' as const,
      regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      mask: '[REDACTED_EMAIL]'
    },
    {
      type: 'PHONE' as const,
      regex: /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}|\b\d{3}[-.\s]\d{4}\b/g,
      mask: '[REDACTED_PHONE]'
    },
    {
      type: 'GOVT_ID' as const,
      regex: /\b\d{3}-\d{2}-\d{4}\b|\b[A-Z]{5}\d{4}[A-Z]{1}\b/g, // SSN / PAN card pattern
      mask: '[REDACTED_GOVT_ID]'
    },
    {
      type: 'CREDIT_CARD' as const,
      regex: /\b(?:\d[ -]*?){13,16}\b/g,
      mask: '[REDACTED_CARD]'
    },
    {
      type: 'DOB' as const,
      regex: /\b(0[1-9]|1[0-2])[\/.-](0[1-9]|[12]\d|3[01])[\/.-](19|20)\d{2}\b|\b(19|20)\d{2}[\/.-](0[1-9]|1[0-2])[\/.-](0[1-9]|[12]\d|3[01])\b/g,
      mask: '[REDACTED_DOB]'
    },
    {
      type: 'PASSWORD' as const,
      regex: /(?:password|pass|secret|auth_token|bearer)\s*[:=]\s*['"]?([^\s'"]+)['"]?/gi,
      mask: '[REDACTED_CREDENTIAL]'
    }
  ];

  public static scanText(text: string, elementId?: string): DetectedPII[] {
    const results: DetectedPII[] = [];
    let counter = 1;

    for (const pattern of PiiDetector.PII_PATTERNS) {
      pattern.regex.lastIndex = 0;
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        results.push({
          id: `pii-item-${counter++}`,
          type: pattern.type,
          originalSnippet: match[0],
          redactedMask: `${pattern.mask}_${counter}`,
          elementId,
          confidence: 0.98,
          timestamp: Date.now()
        });
      }
    }

    return results;
  }
}
