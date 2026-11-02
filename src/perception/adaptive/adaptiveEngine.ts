import { PerceptionState, StructuredElement } from '../../types';
import { DomAnalyzer } from '../dom/domAnalyzer';
import { LocalOcrEngine } from '../ocr/localOcr';
import { ElementScorer } from '../vision/elementScorer';

export class AdaptivePerceptionEngine {
  public static async executePerceptionPipeline(doc: Document = document): Promise<PerceptionState> {
    const startTime = performance.now();
    
    // Tier 1: DOM Analysis
    let rawElements = DomAnalyzer.analyzeDOM(doc);
    let perceptionTier: PerceptionState['tier'] = 'DOM';

    // Tier 2: OCR Fallback if DOM provides fewer than 2 interactive elements
    if (rawElements.length < 2) {
      perceptionTier = 'OCR';
      const dummyCanvas = doc.createElement('canvas');
      dummyCanvas.width = window.innerWidth || 800;
      dummyCanvas.height = window.innerHeight || 600;
      const ocrResult = await LocalOcrEngine.processCanvasOCR(dummyCanvas);
      rawElements = [...rawElements, ...ocrResult.elements];
    }

    // Tier 3: Local Vision Spatial Scoring
    const scoredElements = ElementScorer.scoreElements(rawElements);
    const sensitiveCount = scoredElements.filter((e) => e.sensitivity !== 'PUBLIC').length;

    const avgConfidence = scoredElements.length > 0
      ? scoredElements.reduce((acc, curr) => acc + curr.confidence, 0) / scoredElements.length
      : 0.95;

    return {
      isScanning: false,
      pageTitle: doc.title || 'Active Web Page',
      url: doc.location ? doc.location.href : 'http://localhost/demo',
      tier: perceptionTier,
      elements: scoredElements,
      totalElements: scoredElements.length,
      sensitiveElementsCount: sensitiveCount,
      lastPerceivedAt: Date.now(),
      confidenceScore: Math.min(0.99, Number(avgConfidence.toFixed(2)))
    };
  }
}
