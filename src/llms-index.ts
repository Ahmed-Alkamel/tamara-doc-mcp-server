import { config } from './config.js';
import { fetchUrl } from './fetcher.js';
import { TimedCache } from './cache.js';
import type { DocEntry, DocsIndex } from './types.js';

const cache = new TimedCache<DocsIndex>(config.cache.ttlMs);

function parseLlmTxt(raw: string): DocEntry[] {
  const entries: DocEntry[] = [];
  let currentSection = '';

  const lines = raw.split('\n');
  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    const linkMatch = line.match(/^-\s+\[(.+?)\]\((.+?)\)(?::\s*(.+))?/);
    if (linkMatch && currentSection) {
      const path = linkMatch[2].replace(/^(\.\.\/|\/)/, '');
      entries.push({
        title: linkMatch[1].trim(),
        path,
        section: currentSection,
        description: (linkMatch[3] || '').trim(),
      });
    }
  }

  return entries;
}

function extractSections(entries: DocEntry[]): string[] {
  const seen = new Set<string>();
  return entries.filter((e) => {
    if (seen.has(e.section)) return false;
    seen.add(e.section);
    return true;
  }).map((e) => e.section);
}

export const llmsIndex = {
  async get(): Promise<DocsIndex> {
    const cached = cache.get('index');
    if (cached) return cached;

    const raw = await fetchUrl(config.llmsTxtPath);
    const entries = parseLlmTxt(raw);
    const sections = extractSections(entries);

    const index: DocsIndex = {
      entries,
      sections,
      raw,
      fetchedAt: Date.now(),
    };

    cache.set('index', index);
    return index;
  },

  invalidate(): void {
    cache.clear();
  },
};
