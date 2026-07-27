import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { config } from './config.js';
import { llmsIndex } from './llms-index.js';
import { fetchDocFile } from './fetcher.js';
import { getDocs } from './tools/get-docs.js';
import { searchDocs } from './tools/search-docs.js';
import { getOrderFlow } from './tools/get-order-flow.js';
import { getApiEndpoint } from './tools/get-api-endpoint.js';
import { getWebhookEvents } from './tools/get-webhook-events.js';
import { getTestCards } from './tools/get-test-cards.js';
import { getWidgetGuide } from './tools/get-widget-guide.js';

const server = new Server(
  {
    name: config.server.name,
    version: config.server.version,
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

// ==================== RESOURCES ====================

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const index = await llmsIndex.get();

  const resources = [
    {
      uri: 'tamara-docs://llms.txt',
      name: 'Tamara Documentation Index (llms.txt)',
      description: 'Complete documentation index listing all available docs',
      mimeType: 'text/markdown',
    },
    {
      uri: 'tamara-docs://docs/list',
      name: 'Documentation Files List',
      description: 'JSON list of all documentation files with titles, paths, sections, and descriptions',
      mimeType: 'application/json',
    },
    ...index.entries.map((entry) => ({
      uri: `tamara-docs://docs/${entry.path.replace(/\.md$/, '')}`,
      name: entry.title,
      description: entry.description || entry.title,
      mimeType: 'text/markdown',
    })),
  ];

  return { resources };
});

server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
  resourceTemplates: [
    {
      uriTemplate: 'tamara-docs://order-flow',
      name: 'Order Lifecycle',
      description: 'Tamara order lifecycle with all statuses, transitions, conditions, timers, and API endpoints for each step',
      mimeType: 'text/markdown',
    },
    {
      uriTemplate: 'tamara-docs://webhook-events',
      name: 'Webhook Events',
      description: 'All Tamara webhook event types with JSON payload examples and registration instructions',
      mimeType: 'text/markdown',
    },
    {
      uriTemplate: 'tamara-docs://search/{query}',
      name: 'Search Documentation',
      description: 'Search Tamara documentation by keyword. Returns matching document titles, sections, and descriptions.',
      mimeType: 'text/markdown',
    },
    {
      uriTemplate: 'tamara-docs://api-endpoint/{name}',
      name: 'API Endpoint Details',
      description: 'Get detailed information about a specific Tamara API endpoint: method, path, summary, and full documentation',
      mimeType: 'text/markdown',
    },
    {
      uriTemplate: 'tamara-docs://test-cards/{country}',
      name: 'Test Cards',
      description: 'Tamara test card numbers for sandbox testing. Use "all", "KSA", or "UAE" as the country value.',
      mimeType: 'text/markdown',
    },
    {
      uriTemplate: 'tamara-docs://widget-guide/{platform}',
      name: 'Widget Implementation Guide',
      description: 'Tamara promotional widget implementation guidelines. Platform: web, mobile, flutter, react-native, android, ios',
      mimeType: 'text/markdown',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === 'tamara-docs://llms.txt') {
    const index = await llmsIndex.get();
    return { contents: [{ uri, mimeType: 'text/markdown', text: index.raw }] };
  }

  if (uri === 'tamara-docs://docs/list') {
    const index = await llmsIndex.get();
    const list = index.entries.map((e) => ({
      path: e.path,
      title: e.title,
      section: e.section,
      description: e.description,
      url: `https://docs.tamara.co/${e.path}`,
    }));
    return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(list, null, 2) }] };
  }

  if (uri === 'tamara-docs://order-flow') {
    return { contents: [{ uri, mimeType: 'text/markdown', text: await getOrderFlow() }] };
  }

  if (uri === 'tamara-docs://webhook-events') {
    return { contents: [{ uri, mimeType: 'text/markdown', text: await getWebhookEvents() }] };
  }

  const searchMatch = uri.match(/^tamara-docs:\/\/search\/(.+)/);
  if (searchMatch) {
    const index = await llmsIndex.get();
    const text = await searchDocs(decodeURIComponent(searchMatch[1]), index);
    return { contents: [{ uri, mimeType: 'text/markdown', text }] };
  }

  const apiMatch = uri.match(/^tamara-docs:\/\/api-endpoint\/(.+)/);
  if (apiMatch) {
    return { contents: [{ uri, mimeType: 'text/markdown', text: await getApiEndpoint(decodeURIComponent(apiMatch[1])) }] };
  }

  const cardsMatch = uri.match(/^tamara-docs:\/\/test-cards\/(.+)/);
  if (cardsMatch) {
    const country = decodeURIComponent(cardsMatch[1]);
    return { contents: [{ uri, mimeType: 'text/markdown', text: await getTestCards(country === 'all' ? undefined : country) }] };
  }

  const widgetMatch = uri.match(/^tamara-docs:\/\/widget-guide\/(.+)/);
  if (widgetMatch) {
    return { contents: [{ uri, mimeType: 'text/markdown', text: await getWidgetGuide(decodeURIComponent(widgetMatch[1])) }] };
  }

  const docMatch = uri.match(/^tamara-docs:\/\/docs\/(.+)/);
  if (docMatch) {
    const filePath = docMatch[1];
    try {
      const content = await fetchDocFile(filePath);
      return { contents: [{ uri, mimeType: 'text/markdown', text: content }] };
    } catch (error) {
      return {
        contents: [{
          uri,
          mimeType: 'text/plain',
          text: `Error fetching document: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }],
      };
    }
  }

  throw new Error(`Unknown resource: ${uri}`);
});

// ==================== TOOLS ====================

const TOOLS = [
  {
    name: 'get_docs',
    description: 'Get Tamara documentation by topic. Covers: search, order-flow, api-endpoint, webhook-events, test-cards, widget-guide. Only 1 tool for all docs needs.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Documentation topic to retrieve',
          enum: ['search', 'order-flow', 'api-endpoint', 'webhook-events', 'test-cards', 'widget-guide'],
        },
        query: {
          type: 'string',
          description: 'Search keyword (required when topic=search)',
        },
        endpoint: {
          type: 'string',
          description: 'Endpoint name (required when topic=api-endpoint). Options: pre-checkout, checkout, authorise, capture, cancel, refund, get-order, in-store-sms, in-store-qr, void',
        },
        country: {
          type: 'string',
          description: 'Country for test cards (optional, for topic=test-cards). KSA or UAE. Omitting returns all.',
          enum: ['KSA', 'UAE'],
        },
        platform: {
          type: 'string',
          description: 'Platform for widget guide (required when topic=widget-guide). Options: web, website, mobile, flutter, react-native, android, ios',
        },
      },
      required: ['topic'],
    },
  },
  {
    name: 'refresh_index',
    description: 'Clear the cached documentation index and force a fresh fetch from docs.tamara.co/llms.txt on the next request. Use when you suspect the remote docs have been updated.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = args ?? {};

  try {
    switch (name) {
      case 'get_docs': {
        const topic = String(a.topic);
        const text = await getDocs(topic, a);
        return { content: [{ type: 'text', text }] };
      }

      case 'refresh_index': {
        llmsIndex.invalidate();
        const index = await llmsIndex.get();
        return {
          content: [{
            type: 'text',
            text: `✅ Documentation index refreshed successfully.\n- Total docs: ${index.entries.length}\n- Sections: ${index.sections.length}\n- Fetched at: ${new Date(index.fetchedAt).toISOString()}`,
          }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

// ==================== STARTUP ====================

async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);

    const index = await llmsIndex.get();
    console.error(`[tamara-docs-server] Started successfully`);
    console.error(`[tamara-docs-server] Loaded ${index.entries.length} docs in ${index.sections.length} sections`);
    console.error(`[tamara-docs-server] Registered ${TOOLS.length} tools`);
  } catch (error) {
    console.error(`[tamara-docs-server] Failed to start:`, error);
    process.exit(1);
  }
}

main();
