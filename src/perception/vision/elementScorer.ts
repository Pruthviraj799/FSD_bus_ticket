import { StructuredElement } from '../../types';

export class ElementScorer {
  /**
   * Scores perception elements based on spatial prominence, bounding box area, and visual layout hierarchy.
   */
  public static scoreElements(elements: StructuredElement[]): StructuredElement[] {
    return elements.map((elem) => {
      const [x, y, w, h] = elem.bbox;
      const area = w * h;
      let score = 0.5;

      // Inputs and buttons get high base priority
      if (elem.type === 'input' || elem.type === 'dropdown') score += 0.3;
      if (elem.type === 'button') score += 0.25;
      if (elem.type === 'form') score += 0.2;

      // Reasonable area boost
      if (area > 500 && area < 50000) score += 0.15;

      // PII sensitive items have critical priority
      if (elem.sensitivity !== 'PUBLIC') score += 0.1;

      return {
        ...elem,
        confidence: Math.min(0.99, Number(score.toFixed(2)))
      };
    });
  }
}
