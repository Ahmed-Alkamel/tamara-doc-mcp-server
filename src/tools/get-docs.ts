import { llmsIndex } from '../llms-index.js';
import { searchDocs } from './search-docs.js';
import { getOrderFlow } from './get-order-flow.js';
import { getApiEndpoint } from './get-api-endpoint.js';
import { getWebhookEvents } from './get-webhook-events.js';
import { getTestCards } from './get-test-cards.js';
import { getWidgetGuide } from './get-widget-guide.js';

export async function getDocs(topic: string, params: Record<string, unknown>): Promise<string> {
  switch (topic) {
    case 'search': {
      const query = String(params.query ?? '');
      if (!query) throw new Error('query is required for topic "search"');
      const index = await llmsIndex.get();
      return searchDocs(query, index);
    }
    case 'order-flow':
      return getOrderFlow();
    case 'api-endpoint':
      return getApiEndpoint(String(params.endpoint ?? ''));
    case 'webhook-events':
      return getWebhookEvents();
    case 'test-cards':
      return getTestCards(params.country ? String(params.country) : undefined);
    case 'widget-guide':
      return getWidgetGuide(String(params.platform ?? ''));
    default:
      throw new Error(`Unknown topic: "${topic}". Available: search, order-flow, api-endpoint, webhook-events, test-cards, widget-guide`);
  }
}
