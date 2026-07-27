# Tamara Docs MCP Server

MCP (Model Context Protocol) server for Tamara Payment Gateway documentation. Provides tools and resources sourced from [docs.tamara.co](https://docs.tamara.co/llms.txt).

## Features

### Resources (readable by any MCP client)

| URI | Description |
|-----|-------------|
| `tamara-docs://llms.txt` | Full documentation index from docs.tamara.co |
| `tamara-docs://docs/list` | JSON list of all documentation files |
| `tamara-docs://docs/{path}` | Content of any documentation file |

### Tools (callable by LLMs)

| Tool | Description |
|------|-------------|
| `search_docs(query)` | Search documentation by keyword |
| `get_order_flow()` | Complete order lifecycle with statuses and conditions |
| `get_api_endpoint(endpoint)` | Details for any Tamara API endpoint |
| `get_webhook_events()` | All webhook event types with JSON payloads |
| `get_test_cards(country?)` | Test card numbers (optionally filtered by KSA/UAE) |
| `get_widget_guide(platform)` | Widget implementation guide for web or mobile |

## Installation

```bash
cd tamara-doc-mcp-server
npm install
npm run build
```

## Usage

### Run locally (stdio)

```bash
npm start
```

### Run in development mode

```bash
npm run dev
```

### Integrate with opencode

Add to your `opencode.json`:

```json
{
  "mcp": {
    "tamara-docs": {
      "type": "local",
      "command": ["node", "D:\\path\\to\\tamara-doc-mcp-server\\dist\\index.js"],
      "enabled": true
    }
  }
}
```

Replace the path with the absolute path to the compiled `dist/index.js`.

## Architecture

```
opencode (MCP client)
     │ stdio
     ▼
tamara-docs-mcp-server
     │
     ├── https://docs.tamara.co/llms.txt  ← index
     ├── https://docs.tamara.co/docs/*.md ← doc files
     └── in-memory cache (30 min TTL)
```

All content is fetched from `docs.tamara.co`. No local project files are accessed.

## Project Structure

```
src/
├── index.ts              # Server entry: resources, tools, transport
├── config.ts             # Constants (base URL, cache TTL)
├── fetcher.ts            # HTTP fetch wrapper
├── llms-index.ts         # llms.txt parser and index builder
├── cache.ts              # In-memory TTL cache
├── types.ts              # Shared TypeScript types
└── tools/
    ├── search-docs.ts
    ├── get-order-flow.ts
    ├── get-api-endpoint.ts
    ├── get-webhook-events.ts
    ├── get-test-cards.ts
    └── get-widget-guide.ts
```

## Stack

- **Runtime**: Node.js
- **MCP SDK**: `@modelcontextprotocol/sdk` v1
- **Language**: TypeScript 5
- **Transport**: stdio (for local MCP clients)
