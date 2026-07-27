export interface DocEntry {
  title: string;
  path: string;
  section: string;
  description: string;
}

export interface DocsIndex {
  entries: DocEntry[];
  sections: string[];
  raw: string;
  fetchedAt: number;
}

export interface OrderFlowStep {
  status: string;
  description: string;
  nextStates: string[];
  conditions?: string[];
}

export interface ApiEndpoint {
  name: string;
  method: string;
  path: string;
  summary: string;
  requiredFields?: string[];
}

export interface WebhookEvent {
  eventType: string;
  description: string;
  payloadExample: string;
}
