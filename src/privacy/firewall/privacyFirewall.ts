import { NetworkRequestLog, PrivacyState } from '../../types';

export class PrivacyFirewall {
  private static networkLogs: NetworkRequestLog[] = [];

  /**
   * Evaluates outgoing web requests to ensure zero cloud AI leakage.
   */
  public static inspectRequest(url: string, method: string = 'GET', data?: any): NetworkRequestLog {
    const isExternalAIEndpoint = /api\.openai\.com|api\.anthropic\.com|cohere\.ai|api\.mistral\.ai|huggingface\.co\/api/i.test(url);
    const containsPII = data ? /email|phone|dob|ssn|card|password/i.test(JSON.stringify(data)) : false;

    const blocked = isExternalAIEndpoint || (containsPII && !url.startsWith('chrome-extension://'));

    const logItem: NetworkRequestLog = {
      id: `net-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      url,
      method,
      timestamp: Date.now(),
      containsPII,
      blockedByFirewall: blocked,
      destinationType: isExternalAIEndpoint ? 'BLOCKED_EXTERNAL_AI' : 'WEBSITE_ORIGIN'
    };

    PrivacyFirewall.networkLogs.unshift(logItem);
    if (PrivacyFirewall.networkLogs.length > 50) PrivacyFirewall.networkLogs.pop();

    return logItem;
  }

  public static getInitialPrivacyState(): PrivacyState {
    return {
      firewallActive: true,
      failClosedEnabled: true,
      detectedPIIList: [],
      redactedItemsCount: 0,
      networkLogs: PrivacyFirewall.networkLogs,
      cloudAIStatus: 'OFF',
      sanitizedContextReady: true
    };
  }
}
