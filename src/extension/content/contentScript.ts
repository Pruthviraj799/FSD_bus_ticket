import { AdaptivePerceptionEngine } from '../../perception/adaptive/adaptiveEngine';
import { ActionExecutor } from '../../agent/executor/actionExecutor';
import { ActionVerifier } from '../../agent/verifier/actionVerifier';
import { ContextRedactor } from '../../privacy/redaction/redactor';
import { PromptInjectionDefense } from '../../agent/injection-defense/promptDefense';
import { PlanStep } from '../../types';

console.log('[JARVIS] Content Script loaded on page:', window.location.href);

let currentHighlighterOverlay: HTMLDivElement | null = null;

// Initialize visual bounding box highlight layer
function ensureHighlightOverlay() {
  if (!currentHighlighterOverlay) {
    currentHighlighterOverlay = document.createElement('div');
    currentHighlighterOverlay.id = 'jarvis-highlight-overlay';
    currentHighlighterOverlay.style.position = 'fixed';
    currentHighlighterOverlay.style.top = '0';
    currentHighlighterOverlay.style.left = '0';
    currentHighlighterOverlay.style.width = '100vw';
    currentHighlighterOverlay.style.height = '100vh';
    currentHighlighterOverlay.style.pointerEvents = 'none';
    currentHighlighterOverlay.style.zIndex = '999999';
    document.body.appendChild(currentHighlighterOverlay);
  }
}

// Draw element bounding boxes on webpage
function renderBoundingBoxes(elements: any[]) {
  ensureHighlightOverlay();
  if (!currentHighlighterOverlay) return;

  currentHighlighterOverlay.innerHTML = '';

  elements.forEach((elem) => {
    const [x, y, w, h] = elem.bbox;
    const box = document.createElement('div');
    box.style.position = 'absolute';
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
    box.style.width = `${w}px`;
    box.style.height = `${h}px`;
    box.style.border = elem.sensitivity !== 'PUBLIC' ? '2px dashed #EF4444' : '1px solid #00F0FF';
    box.style.backgroundColor = elem.sensitivity !== 'PUBLIC' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0, 240, 255, 0.05)';
    box.style.borderRadius = '4px';
    box.style.transition = 'all 0.2s ease';

    const label = document.createElement('span');
    label.style.position = 'absolute';
    label.style.top = '-18px';
    label.style.left = '0';
    label.style.fontSize = '10px';
    label.style.fontFamily = 'monospace';
    label.style.padding = '1px 4px';
    label.style.borderRadius = '2px';
    label.style.color = '#0A0D14';
    label.style.fontWeight = 'bold';
    label.style.backgroundColor = elem.sensitivity !== 'PUBLIC' ? '#EF4444' : '#00F0FF';
    label.innerText = `${elem.type}:${elem.sensitivity}`;

    box.appendChild(label);
    currentHighlighterOverlay?.appendChild(box);
  });
}

// Chrome message router
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'PERCEIVE_PAGE') {
    AdaptivePerceptionEngine.executePerceptionPipeline(document).then((perception) => {
      const sanitized = ContextRedactor.sanitizeElements(perception.elements);
      renderBoundingBoxes(sanitized.sanitizedElements);

      // Check prompt injection on raw text
      const pageText = document.body.innerText || '';
      const injectionResult = PromptInjectionDefense.scanWebpageText(pageText);

      sendResponse({
        perception: {
          ...perception,
          elements: sanitized.sanitizedElements
        },
        piiDetected: sanitized.totalPII,
        promptInjection: injectionResult
      });
    });
    return true;
  }

  if (request.action === 'EXECUTE_STEP') {
    const step: PlanStep = request.step;
    ActionExecutor.executeStep(step, document).then((execRes) => {
      if (!execRes.success) {
        sendResponse({ success: false, message: execRes.message });
        return;
      }
      ActionVerifier.verifyStep(step, document).then((verifyRes) => {
        sendResponse({
          success: verifyRes.verified,
          message: verifyRes.reason
        });
      });
    });
    return true;
  }
});
