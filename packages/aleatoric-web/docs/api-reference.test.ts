import { describe, expect, it } from 'vitest';
import { API_CATEGORIES } from './lib/api-reference';
import { API_REFERENCE_SNIPPETS } from './lib/api-reference-snippets';

const ALEATORIC_IMPORT_RE =
  /import\s*\{[^}]+\}\s*from\s*['"]aleatoric(?:-web)?['"]/;

describe('API reference snippets', () => {
  it('every entry has a non-empty example with an aleatoric import', () => {
    for (const cat of API_CATEGORIES) {
      for (const entry of cat.entries) {
        expect(entry.example.trim().length).toBeGreaterThan(0);
        expect(ALEATORIC_IMPORT_RE.test(entry.example)).toBe(true);
      }
    }
  });

  it('examples only import from aleatoric or aleatoric-web', () => {
    for (const cat of API_CATEGORIES) {
      for (const entry of cat.entries) {
        const specs = entry.example.matchAll(/from\s+['"]([^'"]+)['"]/g);
        for (const m of specs) {
          expect(m[1] === 'aleatoric' || m[1] === 'aleatoric-web').toBe(true);
        }
      }
    }
  });

  it('snippet map keys match entry ids exactly', () => {
    const ids = new Set<string>(
      API_CATEGORIES.flatMap((c) => c.entries.map((e) => e.id)),
    );
    const snippetKeys = new Set(Object.keys(API_REFERENCE_SNIPPETS));
    expect(ids.size).toBe(snippetKeys.size);
    for (const id of ids) {
      expect(snippetKeys.has(id)).toBe(true);
    }
    for (const key of snippetKeys) {
      expect(ids.has(key)).toBe(true);
    }
  });
});
