import { DetectedPII, StructuredElement } from '../../types';
import { PiiDetector } from '../pii/piiDetector';

export class ContextRedactor {
  /**
   * Transforms raw text into sanitized text by masking all detected PII.
   */
  public static sanitizeText(text: string, elementId?: string): { sanitizedText: string; piiDetected: DetectedPII[] } {
    const piiDetected = PiiDetector.scanText(text, elementId);
    let sanitizedText = text;

    piiDetected.forEach((pii) => {
      sanitizedText = sanitizedText.replace(pii.originalSnippet, pii.redactedMask);
    });

    return { sanitizedText, piiDetected };
  }

  /**
   * Redacts sensitive fields in structured DOM elements (fail-closed)
   */
  public static sanitizeElements(elements: StructuredElement[]): { sanitizedElements: StructuredElement[]; totalPII: DetectedPII[] } {
    const allPii: DetectedPII[] = [];

    const sanitizedElements = elements.map((elem) => {
      const isSensitive = elem.sensitivity !== 'PUBLIC';
      const scanResult = ContextRedactor.sanitizeText(elem.text || '', elem.element_id);

      allPii.push(...scanResult.piiDetected);

      // Fail-closed rule: if element is marked sensitive or contains PII, redact value & text
      if (isSensitive || scanResult.piiDetected.length > 0) {
        return {
          ...elem,
          text: scanResult.sanitizedText || `[REDACTED_${elem.sensitivity}]`,
          value: elem.value ? '[REDACTED_VALUE_LOCAL_ONLY]' : undefined,
          is_redacted: true
        };
      }

      return elem;
    });

    return { sanitizedElements, totalPII: allPii };
  }
}
