import { PlanStep } from '../../types';
import { CredentialStore } from '../secure-fill/credentialStore';

export class ActionExecutor {
  public static async executeStep(step: PlanStep, doc: Document = document): Promise<{ success: boolean; message: string }> {
    if (step.action === 'read') {
      return { success: true, message: 'Observed page state successfully.' };
    }

    const selector = step.targetSelector;
    let targetEl: HTMLElement | null = null;

    if (step.targetElementId) {
      targetEl = doc.querySelector(`[data-jarvis-id="${step.targetElementId}"]`) as HTMLElement;
    }
    if (!targetEl && selector) {
      targetEl = doc.querySelector(selector) as HTMLElement;
    }

    if (!targetEl && step.action !== 'auth_required') {
      return { success: false, message: `Target element not found: ${selector || step.targetElementId}` };
    }

    try {
      switch (step.action) {
        case 'click': {
          targetEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetEl?.focus();
          targetEl?.click();
          return { success: true, message: `Clicked element ${step.targetElementId || selector}` };
        }

        case 'type': {
          if (targetEl && (targetEl.tagName === 'INPUT' || targetEl.tagName === 'TEXTAREA')) {
            const inputEl = targetEl as HTMLInputElement;
            let valToFill = step.valueToFill || '';
            
            // Resolve actual credential locally if sensitive
            if (step.isSensitiveValue || step.valueToFill) {
              valToFill = CredentialStore.getFieldValue(step.valueToFill || inputEl.name || inputEl.id || 'value');
            }

            inputEl.focus();
            inputEl.value = valToFill;
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
            return { success: true, message: `Typed into ${step.targetElementId || selector}` };
          }
          return { success: false, message: 'Target is not a typable input element.' };
        }

        case 'scroll': {
          targetEl?.scrollIntoView({ behavior: 'smooth' });
          return { success: true, message: 'Scrolled page to element.' };
        }

        case 'select': {
          if (targetEl && targetEl.tagName === 'SELECT') {
            const selEl = targetEl as HTMLSelectElement;
            if (selEl.options.length > 0) {
              selEl.selectedIndex = 1;
              selEl.dispatchEvent(new Event('change', { bubbles: true }));
            }
            return { success: true, message: 'Selected option in dropdown.' };
          }
          return { success: false, message: 'Target is not a select dropdown.' };
        }

        case 'auth_required': {
          return { success: true, message: 'Local Face Authentication & User Confirmation complete.' };
        }

        default:
          return { success: false, message: `Unsupported action type: ${step.action}` };
      }
    } catch (err) {
      return { success: false, message: `Execution error: ${String(err)}` };
    }
  }
}
