import { StructuredElement, SensitivityLevel, AllowedAction } from '../../types';

export class DomAnalyzer {
  public static analyzeDOM(rootDocument: Document = document): StructuredElement[] {
    const elements: StructuredElement[] = [];
    let idCounter = 1;

    const selectors = [
      'input',
      'button',
      'a[href]',
      'textarea',
      'select',
      'form',
      'h1, h2, h3',
      '[role="button"]',
      '[role="input"]',
      '[contenteditable="true"]'
    ];

    const nodes = Array.from(rootDocument.querySelectorAll(selectors.join(',')));

    nodes.forEach((node) => {
      const el = node as HTMLElement;
      
      // Filter non-visible or hidden elements
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0 || window.getComputedStyle(el).display === 'none' || window.getComputedStyle(el).visibility === 'hidden') {
        return;
      }

      const tagName = el.tagName.toLowerCase();
      let type: StructuredElement['type'] = 'button';
      let input_type: string | undefined = undefined;
      let field_name: string | undefined = undefined;

      // Extract associated label text if exists
      let labelText = '';
      if (el.id) {
        const labelEl = rootDocument.querySelector(`label[for="${el.id}"]`);
        if (labelEl) labelText = labelEl.textContent?.trim() || '';
      }
      if (!labelText && el.parentElement?.tagName.toLowerCase() === 'label') {
        labelText = el.parentElement.textContent?.trim() || '';
      }

      let text = labelText || (el.innerText || el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.getAttribute('name') || el.getAttribute('value') || '').trim();

      if (tagName === 'input') {
        const inp = el as HTMLInputElement;
        input_type = inp.type || 'text';
        field_name = inp.name || inp.id || inp.placeholder || 'input_field';
        
        if (input_type === 'checkbox') type = 'checkbox';
        else if (input_type === 'radio') type = 'radio';
        else type = 'input';
      } else if (tagName === 'textarea') {
        type = 'input';
        input_type = 'textarea';
        field_name = (el as HTMLTextAreaElement).name || el.id || 'textarea_field';
      } else if (tagName === 'select') {
        type = 'dropdown';
        field_name = (el as HTMLSelectElement).name || el.id || 'select_field';
      } else if (tagName === 'button' || el.getAttribute('role') === 'button') {
        type = 'button';
      } else if (tagName === 'a') {
        type = 'link';
      } else if (tagName.startsWith('h')) {
        type = 'heading';
      } else if (tagName === 'form') {
        type = 'form';
      }

      // Determine Sensitivity Level
      const sensitivity = DomAnalyzer.classifySensitivity(el, input_type, field_name, text);

      // Determine Allowed Actions
      const allowedActions: AllowedAction[] = [];
      if (type === 'input' || type === 'dropdown') allowedActions.push('type', 'select', 'read');
      if (type === 'button' || type === 'link' || type === 'checkbox' || type === 'radio') allowedActions.push('click');
      if (sensitivity === 'CREDENTIAL' || sensitivity === 'SENSITIVE_PII' || sensitivity === 'FINANCIAL') {
        allowedActions.push('auth_required');
      }

      const uniqueId = `jarvis-elem-${idCounter++}`;
      el.setAttribute('data-jarvis-id', uniqueId);

      elements.push({
        element_id: uniqueId,
        type,
        text: text.slice(0, 120),
        field_name,
        input_type,
        placeholder: el.getAttribute('placeholder') || undefined,
        location: { x: Math.round(rect.left), y: Math.round(rect.top) },
        selector: DomAnalyzer.generateSelector(el),
        bbox: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)],
        confidence: 0.96,
        sensitivity,
        allowed_action: allowedActions,
        value: (el as HTMLInputElement).value || undefined
      });
    });

    return elements;
  }

  private static classifySensitivity(el: HTMLElement, inputType?: string, fieldName?: string, text?: string): SensitivityLevel {
    const combinedStr = `${el.id} ${el.className} ${fieldName || ''} ${text || ''} ${el.getAttribute('autocomplete') || ''}`.toLowerCase();

    if (inputType === 'password' || combinedStr.includes('password') || combinedStr.includes('secret') || combinedStr.includes('token')) {
      return 'CREDENTIAL';
    }
    if (combinedStr.includes('card') || combinedStr.includes('cvv') || combinedStr.includes('account') || combinedStr.includes('iban') || combinedStr.includes('bank')) {
      return 'FINANCIAL';
    }
    if (combinedStr.includes('ssn') || combinedStr.includes('passport') || combinedStr.includes('dob') || combinedStr.includes('birth') || combinedStr.includes('social security') || combinedStr.includes('phone') || combinedStr.includes('email') || combinedStr.includes('address')) {
      return 'SENSITIVE_PII';
    }
    if (inputType === 'email' || inputType === 'tel') {
      return 'SENSITIVE_PII';
    }
    return 'PUBLIC';
  }

  private static generateSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`;
    if (el.getAttribute('name')) return `${el.tagName.toLowerCase()}[name="${el.getAttribute('name')}"]`;
    const dataId = el.getAttribute('data-jarvis-id');
    if (dataId) return `[data-jarvis-id="${dataId}"]`;
    return el.tagName.toLowerCase();
  }
}
