export const config = {
  baseUrl: 'https://docs.tamara.co',

  llmsTxtPath: '/llms.txt',

  cache: {
    ttlMs: 30 * 60 * 1000,
    fetchTimeoutMs: 10000,
  },

  server: {
    name: 'tamara-docs-server',
    version: '1.0.0',
  },
} as const;
