import { config } from './config.js';

export class FetchError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'FetchError';
  }
}

export async function fetchUrl(path: string): Promise<string> {
  const url = path.startsWith('http') ? path : `${config.baseUrl}${path}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.cache.fetchTimeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new FetchError(
        response.status,
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`
      );
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchDocFile(filePath: string): Promise<string> {
  const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  const docPath = normalizedPath.endsWith('.md') ? normalizedPath : `${normalizedPath}.md`;
  return fetchUrl(docPath);
}

export async function fetchRawUrl(url: string): Promise<string> {
  return fetchUrl(url);
}
