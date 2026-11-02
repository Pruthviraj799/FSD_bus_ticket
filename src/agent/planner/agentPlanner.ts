import { PlanStep, StructuredElement, RiskLevel } from '../../types';

export class AgentPlanner {
  public static createPlan(userPrompt: string, elements: StructuredElement[]): PlanStep[] {
    const prompt = userPrompt.toLowerCase();
    const steps: PlanStep[] = [];
    let stepCounter = 1;

    // Check scenario type
    if (prompt.includes('fill') && prompt.includes('profile')) {
      const inputs = elements.filter((e) => e.type === 'input' || e.type === 'dropdown');
      
      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: 1,
        description: 'Observe webpage layout & detect form inputs',
        action: 'read',
        reason: 'Identify form structure and sensitive fields',
        risk: 'LOW',
        confidence: 0.98,
        status: 'COMPLETED'
      });

      inputs.forEach((input) => {
        const isSensitive = input.sensitivity !== 'PUBLIC';
        const risk: RiskLevel = isSensitive ? 'MEDIUM' : 'LOW';

        steps.push({
          id: `step-${stepCounter++}`,
          stepNumber: steps.length + 1,
          description: `Fill ${input.field_name || input.input_type || 'field'} (${input.sensitivity})`,
          action: 'type',
          targetElementId: input.element_id,
          targetSelector: input.selector,
          valueToFill: input.field_name || 'value',
          isSensitiveValue: isSensitive,
          reason: `Populate user profile data for ${input.field_name || 'input'}`,
          risk,
          confidence: 0.96,
          status: 'PENDING'
        });
      });

      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: steps.length + 1,
        description: 'Verify all form fields filled correctly',
        action: 'read',
        reason: 'Post-action verification check',
        risk: 'LOW',
        confidence: 0.97,
        status: 'PENDING'
      });
    } else if (prompt.includes('search')) {
      const searchInput = elements.find((e) => e.type === 'input' && (e.field_name?.includes('search') || e.text.includes('search') || e.placeholder?.includes('search'))) || elements.find((e) => e.type === 'input');
      const searchButton = elements.find((e) => e.type === 'button' && e.text.toLowerCase().includes('search')) || elements.find((e) => e.type === 'button');

      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: 1,
        description: 'Locate search query input field',
        action: 'read',
        targetElementId: searchInput?.element_id,
        targetSelector: searchInput?.selector,
        reason: 'Identify search field on page',
        risk: 'LOW',
        confidence: 0.95,
        status: 'COMPLETED'
      });

      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: 2,
        description: 'Type search query: "AI Internships 2026"',
        action: 'type',
        targetElementId: searchInput?.element_id,
        targetSelector: searchInput?.selector,
        valueToFill: 'AI Internships 2026',
        reason: 'Enter user query into search input',
        risk: 'LOW',
        confidence: 0.96,
        status: 'PENDING'
      });

      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: 3,
        description: 'Click Search button',
        action: 'click',
        targetElementId: searchButton?.element_id,
        targetSelector: searchButton?.selector,
        reason: 'Submit search request',
        risk: 'LOW',
        confidence: 0.94,
        status: 'PENDING'
      });

      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: 4,
        description: 'Verify search results page loaded',
        action: 'read',
        reason: 'Verify DOM updated with search results',
        risk: 'LOW',
        confidence: 0.95,
        status: 'PENDING'
      });
    } else if (prompt.includes('submit')) {
      const submitBtn = elements.find((e) => e.type === 'button' && (e.text.toLowerCase().includes('submit') || e.text.toLowerCase().includes('save'))) || elements.find((e) => e.type === 'button');

      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: 1,
        description: 'Prepare high-risk submission task',
        action: 'read',
        reason: 'Scan form state prior to submission',
        risk: 'MEDIUM',
        confidence: 0.98,
        status: 'COMPLETED'
      });

      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: 2,
        description: 'Request Local Face Authentication & User Confirmation',
        action: 'auth_required',
        reason: 'HIGH/CRITICAL risk action requires biometric authorization',
        risk: 'CRITICAL',
        confidence: 0.99,
        status: 'PENDING'
      });

      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: 3,
        description: `Click Submit button (${submitBtn?.text || 'Submit'})`,
        action: 'click',
        targetElementId: submitBtn?.element_id,
        targetSelector: submitBtn?.selector,
        reason: 'Execute form submission after biometric verification',
        risk: 'HIGH',
        confidence: 0.95,
        status: 'PENDING'
      });

      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: 4,
        description: 'Verify submission confirmation state',
        action: 'read',
        reason: 'Verify success banner or response URL',
        risk: 'LOW',
        confidence: 0.96,
        status: 'PENDING'
      });
    } else {
      // Default general browser task planner
      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: 1,
        description: `Analyze webpage for task: "${userPrompt}"`,
        action: 'read',
        reason: 'Understand page elements and goal',
        risk: 'LOW',
        confidence: 0.90,
        status: 'COMPLETED'
      });
      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: 2,
        description: 'Execute planned interaction',
        action: 'click',
        targetElementId: elements[0]?.element_id,
        targetSelector: elements[0]?.selector,
        reason: 'Interact with target element',
        risk: 'LOW',
        confidence: 0.88,
        status: 'PENDING'
      });
      steps.push({
        id: `step-${stepCounter++}`,
        stepNumber: 3,
        description: 'Verify outcome',
        action: 'read',
        reason: 'Ensure state update',
        risk: 'LOW',
        confidence: 0.90,
        status: 'PENDING'
      });
    }

    return steps;
  }
}
