import { fetchRawUrl } from '../fetcher.js';
import type { DocsIndex } from '../types.js';

export interface SearchResult {
  path: string;
  title: string;
  section: string;
  snippet: string;
  relevance: number;
}

export async function searchDocs(query: string, index: DocsIndex): Promise<string> {
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const entry of index.entries) {
    let relevance = 0;

    if (entry.title.toLowerCase().includes(q)) relevance += 10;
    if (entry.description.toLowerCase().includes(q)) relevance += 5;
    if (entry.section.toLowerCase().includes(q)) relevance += 3;

    if (relevance > 0) {
      const snippet = entry.description
        ? highlight(entry.description, q)
        : entry.title;

      results.push({
        path: entry.path,
        title: entry.title,
        section: entry.section,
        snippet,
        relevance,
      });
    }
  }

  if (results.length === 0) {
    return `No results found for "${query}" in the documentation index.`;
  }

  results.sort((a, b) => b.relevance - a.relevance);
  const top = results.slice(0, 15);

  let output = `# Search Results for "${query}"\n\nFound ${results.length} result(s). Showing top ${top.length}:\n\n`;

  for (const r of top) {
    output += `### ${r.title}\n`;
    output += `- **Section**: ${r.section}\n`;
    output += `- **Path**: https://docs.tamara.co/${r.path}\n`;
    output += `- **Description**: ${r.snippet}\n\n`;
  }

  return output;
}

function highlight(text: string, query: string): string {
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '**$1**');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
