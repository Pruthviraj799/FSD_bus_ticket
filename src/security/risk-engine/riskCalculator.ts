import { RiskLevel, AllowedAction, SensitivityLevel } from '../../types';

export class RiskCalculator {
  public static evaluateRisk(action: AllowedAction, sensitivity: SensitivityLevel, targetName?: string): RiskLevel {
    if (action === 'auth_required' || sensitivity === 'CREDENTIAL' || sensitivity === 'FINANCIAL') {
      return 'CRITICAL';
    }

    if (action === 'click' && (targetName?.toLowerCase().includes('submit') || targetName?.toLowerCase().includes('pay') || targetName?.toLowerCase().includes('delete'))) {
      return 'HIGH';
    }

    if (action === 'type' && sensitivity === 'SENSITIVE_PII') {
      return 'MEDIUM';
    }

    return 'LOW';
  }
}
