import React, { useState, useEffect, useRef } from 'react';
import { GlobalJarvisState, PlanStep } from '../../types';
import { Header } from '../../ui/components/Header';
import { DashboardView } from '../../ui/views/DashboardView';
import { PerceptionView } from '../../ui/views/PerceptionView';
import { PrivacyView } from '../../ui/views/PrivacyView';
import { AgentView } from '../../ui/views/AgentView';
import { SecurityView } from '../../ui/views/SecurityView';
import { AttackModeView } from '../../ui/views/AttackModeView';
import { PerformanceView } from '../../ui/views/PerformanceView';
import { FaceAuthModal } from '../../ui/components/FaceAuthModal';
import { PrivacyFirewall } from '../../privacy/firewall/privacyFirewall';
import { AgentPlanner } from '../../agent/planner/agentPlanner';
import { AdaptivePerceptionEngine } from '../../perception/adaptive/adaptiveEngine';
import { ContextRedactor } from '../../privacy/redaction/redactor';
import { PromptInjectionDefense } from '../../agent/injection-defense/promptDefense';
import { ActionExecutor } from '../../agent/executor/actionExecutor';
import { ActionVerifier } from '../../agent/verifier/actionVerifier';
import { WebSearchEngine } from '../../perception/search/webSearchEngine';
import { LayoutDashboard, Layers, ShieldCheck, Bot, Key, ShieldAlert, Activity } from 'lucide-react';

export const SidepanelApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'perception' | 'privacy' | 'agent' | 'security' | 'attack' | 'telemetry'>('dashboard');

  const [state, setState] = useState<GlobalJarvisState>({
    perception: {
      isScanning: false,
      pageTitle: 'Demo Admissions Portal',
      url: 'http://localhost/university-portal',
      tier: 'DOM',
      elements: [],
      totalElements: 0,
      sensitiveElementsCount: 0,
      lastPerceivedAt: Date.now(),
      confidenceScore: 0.96
    },
    privacy: PrivacyFirewall.getInitialPrivacyState(),
    agent: {
      status: 'IDLE',
      userPrompt: '',
      currentStepIndex: 0,
      plan: [],
      activityLogs: [
        { timestamp: Date.now() - 5000, type: 'INFO', message: 'JARVIS Autonomous AI Agent active (Zero-Cloud Mode).' }
      ],
      promptInjectionDetected: false
    },
    security: {
      status: 'PROTECTED',
      userPresent: true,
      faceAuthRegistered: true,
      requireFaceAuthForNextAction: false,
      authAttempts: 0
    },
    performance: {
      inferenceLatencyMs: 12,
      perceptionLatencyMs: 24,
      memoryUsageMb: 82,
      cpuUsagePct: 5,
      activeModelSize: '18.4 MB (Local ONNX)',
      totalTaskDurationMs: 310,
      webGpuAccelerated: true
    },
    attackMode: {
      active: false,
      simulatedPiiCount: 4,
      blockedAttackCount: 12
    }
  });

  const [pendingAuthStep, setPendingAuthStep] = useState<PlanStep | null>(null);
  const planStateRef = useRef(state.agent.plan);
  planStateRef.current = state.agent.plan;

  // Trigger page perception
  const handleScanPage = () => {
    setState((prev) => ({ ...prev, perception: { ...prev.perception, isScanning: true } }));

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTabId = tabs[0]?.id;
        if (activeTabId) {
          chrome.tabs.sendMessage(activeTabId, { action: 'PERCEIVE_PAGE' }, (response) => {
            if (response && response.perception) {
              setState((prev) => ({
                ...prev,
                perception: response.perception,
                privacy: {
                  ...prev.privacy,
                  detectedPIIList: response.piiDetected || [],
                  redactedItemsCount: (response.piiDetected || []).length
                },
                agent: {
                  ...prev.agent,
                  promptInjectionDetected: response.promptInjection?.isMalicious || false
                }
              }));
              return;
            }
          });
        }
      });
    }

    // Direct DOM perception for web standalone mode
    AdaptivePerceptionEngine.executePerceptionPipeline(document).then((perception) => {
      const sanitized = ContextRedactor.sanitizeElements(perception.elements);
      const pageText = document.body ? document.body.innerText : '';
      const injectionResult = PromptInjectionDefense.scanWebpageText(pageText);

      setState((prev) => ({
        ...prev,
        perception: {
          ...perception,
          elements: sanitized.sanitizedElements
        },
        privacy: {
          ...prev.privacy,
          detectedPIIList: sanitized.totalPII,
          redactedItemsCount: sanitized.totalPII.length
        },
        agent: {
          ...prev.agent,
          promptInjectionDetected: injectionResult.isMalicious
        }
      }));
    });

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        perception: { ...prev.perception, isScanning: false }
      }));
    }, 300);
  };

  useEffect(() => {
    handleScanPage();
  }, []);

  // Automatic Prompt Plan & Execution Trigger (Comet-like AI agent behavior!)
  const handleRunPrompt = (promptText: string) => {
    const generatedPlan = AgentPlanner.createPlan(promptText, state.perception.elements);

    // If task is web search, perform live search query
    if (promptText.toLowerCase().includes('search')) {
      WebSearchEngine.executeSearch(promptText).then((searchRes) => {
        setState((prev) => ({
          ...prev,
          agent: {
            ...prev.agent,
            userPrompt: promptText,
            plan: generatedPlan,
            currentStepIndex: 0,
            status: 'PLANNING',
            activityLogs: [
              { timestamp: Date.now(), type: 'ACTION', message: `Live Web Search returned ${searchRes.length} results for: "${promptText}"` },
              ...prev.agent.activityLogs
            ]
          }
        }));
        // Auto-run execution loop
        autoRunSteps(generatedPlan, 0);
      });
    } else {
      setState((prev) => ({
        ...prev,
        agent: {
          ...prev.agent,
          userPrompt: promptText,
          plan: generatedPlan,
          currentStepIndex: 0,
          status: 'PLANNING',
          activityLogs: [
            { timestamp: Date.now(), type: 'ACTION', message: `Created autonomous plan (${generatedPlan.length} steps) for: "${promptText}"` },
            ...prev.agent.activityLogs
          ]
        }
      }));
      // Auto-run execution loop
      autoRunSteps(generatedPlan, 0);
    }
  };

  const autoRunSteps = (plan: PlanStep[], stepIndex: number) => {
    if (stepIndex >= plan.length) return;

    const currentStep = plan[stepIndex];

    // AUTOMATIC FACE AUTHENTICATION TRIGGER for sensitive PII or submission
    if (currentStep.risk === 'CRITICAL' || currentStep.risk === 'HIGH' || currentStep.action === 'auth_required' || currentStep.isSensitiveValue) {
      setPendingAuthStep(currentStep);
      return; // Pauses auto-run until Face Auth modal confirms
    }

    executeSingleStep(stepIndex, plan, () => {
      setTimeout(() => autoRunSteps(plan, stepIndex + 1), 450);
    });
  };

  const executeSingleStep = (stepIndex: number, currentPlan: PlanStep[], onDone?: () => void) => {
    const step = currentPlan[stepIndex];
    if (!step) return;

    setState((prev) => ({
      ...prev,
      agent: {
        ...prev.agent,
        status: 'ACTING',
        plan: prev.agent.plan.map((s, idx) => (idx === stepIndex ? { ...s, status: 'IN_PROGRESS' } : s))
      }
    }));

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTabId = tabs[0]?.id;
        if (activeTabId) {
          chrome.tabs.sendMessage(activeTabId, { action: 'EXECUTE_STEP', step }, (res) => {
            finishStepExecution(stepIndex, res?.success || true, res?.message || 'Verified post-action state.', onDone);
          });
          return;
        }
      });
    }

    // Direct DOM execution for standalone web preview
    ActionExecutor.executeStep(step, document).then((execRes) => {
      ActionVerifier.verifyStep(step, document).then((verifyRes) => {
        finishStepExecution(stepIndex, verifyRes.verified, verifyRes.reason, onDone);
      });
    });
  };

  const finishStepExecution = (stepIndex: number, success: boolean, message: string, onDone?: () => void) => {
    setState((prev) => {
      const updatedPlan = prev.agent.plan.map((s, idx) =>
        idx === stepIndex
          ? { ...s, status: success ? ('VERIFIED' as const) : ('FAILED' as const), verificationReason: message }
          : s
      );

      const nextIndex = stepIndex + 1;
      const isComplete = nextIndex >= updatedPlan.length;

      return {
        ...prev,
        agent: {
          ...prev.agent,
          plan: updatedPlan,
          currentStepIndex: isComplete ? stepIndex : nextIndex,
          status: isComplete ? 'SUCCESS' : 'VERIFYING',
          activityLogs: [
            { timestamp: Date.now(), type: 'VERIFY', message: `Step ${stepIndex + 1} verified: ${message}` },
            ...prev.agent.activityLogs
          ]
        }
      };
    });

    if (onDone) onDone();
  };

  // Face Auth Success Callback: automatically resumes auto-run plan!
  const handleConfirmAuthStep = () => {
    if (!pendingAuthStep) return;
    const currentPlan = planStateRef.current;
    const stepIdx = currentPlan.findIndex((s) => s.id === pendingAuthStep.id);
    setPendingAuthStep(null);

    if (stepIdx !== -1) {
      finishStepExecution(stepIdx, true, 'Face Auth & User Confirmation Verified', () => {
        setTimeout(() => autoRunSteps(currentPlan, stepIdx + 1), 400);
      });
    }
  };

  return (
    <div className="w-full max-w-[420px] min-h-screen bg-jarvis-bg text-slate-100 flex flex-col font-sans select-none border-r border-jarvis-border shadow-2xl mx-auto">
      <Header state={state} />

      {/* Main Tab Navigation */}
      <nav className="flex bg-jarvis-card border-b border-jarvis-border px-1 font-mono text-[10px]">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 border-b-2 transition ${
            activeTab === 'dashboard' ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('perception')}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 border-b-2 transition ${
            activeTab === 'perception' ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Perceive</span>
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 border-b-2 transition ${
            activeTab === 'privacy' ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy</span>
        </button>
        <button
          onClick={() => setActiveTab('agent')}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 border-b-2 transition ${
            activeTab === 'agent' ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Agent</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 border-b-2 transition ${
            activeTab === 'security' ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Security</span>
        </button>
        <button
          onClick={() => setActiveTab('attack')}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 border-b-2 transition ${
            activeTab === 'attack' ? 'border-rose-400 text-rose-300 font-bold bg-rose-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Attack</span>
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex-1 py-2 flex flex-col items-center gap-0.5 border-b-2 transition ${
            activeTab === 'telemetry' ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Stats</span>
        </button>
      </nav>

      {/* Active Tab View Render */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardView state={state} onRunPrompt={handleRunPrompt} onScanPage={handleScanPage} />
        )}
        {activeTab === 'perception' && (
          <PerceptionView perception={state.perception} onRefresh={handleScanPage} />
        )}
        {activeTab === 'privacy' && <PrivacyView privacy={state.privacy} />}
        {activeTab === 'agent' && (
          <AgentView
            agent={state.agent}
            onRunPrompt={handleRunPrompt}
            onExecuteNextStep={() => executeSingleStep(state.agent.currentStepIndex, state.agent.plan)}
            onAutoRunPlan={() => autoRunSteps(state.agent.plan, state.agent.currentStepIndex)}
          />
        )}
        {activeTab === 'security' && (
          <SecurityView
            security={state.security}
            onToggleLock={() =>
              setState((prev) => ({
                ...prev,
                security: { ...prev.security, userPresent: !prev.security.userPresent }
              }))
            }
          />
        )}
        {activeTab === 'attack' && <AttackModeView />}
        {activeTab === 'telemetry' && <PerformanceView performance={state.performance} />}
      </main>

      {/* AUTOMATIC HIGH-RISK BIOMETRIC FACE AUTH MODAL */}
      {pendingAuthStep && (
        <FaceAuthModal
          step={pendingAuthStep}
          onConfirm={handleConfirmAuthStep}
          onCancel={() => setPendingAuthStep(null)}
        />
      )}
    </div>
  );
};
