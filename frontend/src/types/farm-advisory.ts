export type AdvisoryMessageRole = 'user' | 'assistant';

export type AdvisoryUrgency = 'low' | 'medium' | 'high';

export interface AdvisoryMessage {
  id: string;
  role: AdvisoryMessageRole;
  content: string;
  createdAt: string;
}

export interface AdvisoryChatRequest {
  messages: AdvisoryMessage[];
  cropHint?: string;
  regionHint?: string;
}

export interface AdvisoryChatResponse {
  message: AdvisoryMessage;
  suggestedFollowUps?: string[];
  urgency?: AdvisoryUrgency;
  topicLabel?: string;
}
