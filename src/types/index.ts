export type SensitivityLevel = 'PUBLIC' | 'LOW_RISK' | 'SENSITIVE_PII' | 'CREDENTIAL' | 'FINANCIAL' | 'UNKNOWN';

export type AllowedAction = 'click' | 'type' | 'scroll' | 'select' | 'read' | 'block' | 'auth_required';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StructuredElement {
  element_id: string;
  type: 'input' | 'button' | 'link' | 'form' | 'label' | 'heading' | 'table' | 'checkbox' | 'radio' | 'dropdown' | 'image' | 'menu' | 'dialog';
  text: string;
  field_name?: string;
  input_type?: string;
  placeholder?: string;
  location: { x: number; y: number };
  selector: string;
  bbox: [number, number, number, number]; // [x, y, w, h]
  confidence: number;
  sensitivity: SensitivityLevel;
  allowed_action: AllowedAction[];
  value?: string;
  is_redacted?: boolean;
}

export interface PerceptionState {
  isScanning: boolean;
  pageTitle: string;
  url: string;
  tier: 'DOM' | 'OCR' | 'LOCAL_VISION';
  elements: StructuredElement[];
  totalElements: number;
  sensitiveElementsCount: number;
  lastPerceivedAt: number;
  confidenceScore: number;
}

export interface DetectedPII {
  id: string;
  type: 'EMAIL' | 'PHONE' | 'DOB' | 'ADDRESS' | 'PASSWORD' | 'GOVT_ID' | 'CREDIT_CARD' | 'NAME' | 'SECRET_TOKEN';
  originalSnippet: string;
  redactedMask: string;
  elementId?: string;
  confidence: number;
  timestamp: number;
}

export interface NetworkRequestLog {
  id: string;
  url: string;
  method: string;
  timestamp: number;
  containsPII: boolean;
  blockedByFirewall: boolean;
  destinationType: 'WEBSITE_ORIGIN' | 'BLOCKED_EXTERNAL_AI' | 'LOCAL_RUNTIME';
}

export interface PrivacyState {
  firewallActive: boolean;
  failClosedEnabled: boolean;
  detectedPIIList: DetectedPII[];
  redactedItemsCount: number;
  networkLogs: NetworkRequestLog[];
  cloudAIStatus: 'OFF' | 'BLOCKED';
  sanitizedContextReady: boolean;
}

export type AgentStatus = 'IDLE' | 'THINKING' | 'PLANNING' | 'ACTING' | 'VERIFYING' | 'SUCCESS' | 'UNCERTAIN' | 'RE-ANALYZE';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PlanStep {
  id: string;
  stepNumber: number;
  description: string;
  action: AllowedAction;
  targetElementId?: string;
  targetSelector?: string;
  valueToFill?: string;
  isSensitiveValue?: boolean;
  reason: string;
  risk: RiskLevel;
  confidence: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'VERIFIED' | 'RE_TRYING';
  verificationReason?: string;
}

export interface AgentState {
  status: AgentStatus;
  userPrompt: string;
  currentStepIndex: number;
  plan: PlanStep[];
  activeAction?: PlanStep;
  activityLogs: { timestamp: number; type: 'INFO' | 'WARN' | 'ACTION' | 'VERIFY' | 'SECURITY'; message: string }[];
  promptInjectionDetected: boolean;
  promptInjectionDetails?: string;
}

export type SecurityStatus = 'PROTECTED' | 'WARNING' | 'BLOCKED' | 'LOCKED' | 'AUTHENTICATING' | 'VERIFIED';

export interface SecurityState {
  status: SecurityStatus;
  userPresent: boolean;
  faceAuthRegistered: boolean;
  requireFaceAuthForNextAction: boolean;
  pendingHighRiskStep?: PlanStep;
  lastAuthenticatedAt?: number;
  authAttempts: number;
}

export interface PerformanceMetrics {
  inferenceLatencyMs: number;
  perceptionLatencyMs: number;
  memoryUsageMb: number;
  cpuUsagePct: number;
  activeModelSize: string;
  totalTaskDurationMs: number;
  webGpuAccelerated: boolean;
}

export interface GlobalJarvisState {
  perception: PerceptionState;
  privacy: PrivacyState;
  agent: AgentState;
  security: SecurityState;
  performance: PerformanceMetrics;
  attackMode: {
    active: boolean;
    simulatedPiiCount: number;
    blockedAttackCount: number;
  };
}
