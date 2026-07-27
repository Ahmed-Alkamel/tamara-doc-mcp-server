import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { config } from './config.js';
import { llmsIndex } from './llms-index.js';
import { fetchDocFile } from './fetcher.js';
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

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === 'tamara-docs://llms.txt') {
    const index = await llmsIndex.get();
    return {
      contents: [{ uri, mimeType: 'text/markdown', text: index.raw }],
    };
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
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(list, null, 2) }],
    };
  }

  const docMatch = uri.match(/^tamara-docs:\/\/docs\/(.+)/);
  if (docMatch) {
    const filePath = docMatch[1];
    try {
      const content = await fetchDocFile(filePath);
      return {
        contents: [{ uri, mimeType: 'text/markdown', text: content }],
      };
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
    name: 'search_docs',
    description: 'Search Tamara documentation by keyword. Returns matching document titles, sections, and descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keyword to find in documentation' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_order_flow',
    description: 'Get the complete Tamara order lifecycle including all statuses, transitions, conditions, timers, and the corresponding API endpoints for each step.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_api_endpoint',
    description: 'Get detailed information about a specific Tamara API endpoint: method, path, summary, and full documentation content.',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: {
          type: 'string',
          description: 'Endpoint name. Available: pre-checkout, checkout, authorise, capture, cancel, refund, get-order, in-store-sms, in-store-qr, void',
          enum: ['pre-checkout', 'checkout', 'authorise', 'capture', 'cancel', 'refund', 'get-order', 'in-store-sms', 'in-store-qr', 'void'],
        },
      },
      required: ['endpoint'],
    },
  },
  {
    name: 'get_webhook_events',
    description: 'Get all Tamara webhook event types with their JSON payload examples and registration instructions.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_test_cards',
    description: 'Get Tamara test card numbers for sandbox testing. Optionally filter by country (KSA or UAE).',
    inputSchema: {
      type: 'object',
      properties: {
        country: {
          type: 'string',
          description: 'Country to filter test cards for (KSA or UAE). If omitted, returns all cards.',
          enum: ['KSA', 'UAE'],
        },
      },
    },
  },
  {
    name: 'get_widget_guide',
    description: 'Get Tamara promotional widget implementation guidelines for web or mobile platforms.',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          description: 'Target platform: web/website or mobile/flutter/react-native/android/ios',
          enum: ['web', 'website', 'mobile', 'flutter', 'react-native', 'android', 'ios'],
        },
      },
      required: ['platform'],
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
      case 'search_docs': {
        const index = await llmsIndex.get();
        const result = await searchDocs(String(a.query), index);
        return { content: [{ type: 'text', text: result }] };
      }

      case 'get_order_flow': {
        const result = await getOrderFlow();
        return { content: [{ type: 'text', text: result }] };
      }

      case 'get_api_endpoint': {
        const result = await getApiEndpoint(String(a.endpoint));
        return { content: [{ type: 'text', text: result }] };
      }

      case 'get_webhook_events': {
        const result = await getWebhookEvents();
        return { content: [{ type: 'text', text: result }] };
      }

      case 'get_test_cards': {
        const result = await getTestCards(a.country ? String(a.country) : undefined);
        return { content: [{ type: 'text', text: result }] };
      }

      case 'get_widget_guide': {
        const result = await getWidgetGuide(String(a.platform));
        return { content: [{ type: 'text', text: result }] };
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
