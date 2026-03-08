import {
  CELLULAR_PITCH_MAPPING_KINDS,
  CHANCE_METHODS,
  CHORD_QUALITIES,
  CONTOUR_DIRECTIONS,
  DURATION_NAMES,
  INTERVAL_ENUM_MEMBERS,
  PITCH_DISTRIBUTIONS,
  SCALE_TYPE_NAMES,
} from 'aleatoric';
import { describe, expect, it } from 'vitest';
import { CORE_API_CATEGORIES } from './lib/core-api-reference';
import { CORE_API_REFERENCE_SNIPPETS } from './lib/core-api-reference-snippets';
import {
  CELLULAR_PITCH_MAPPING_ENUM_DOCS,
  CHANCE_METHOD_ENUM_DOCS,
  CHORD_QUALITY_ENUM_DOCS,
  CONTOUR_DIRECTION_ENUM_DOCS,
  DURATION_NAME_ENUM_DOCS,
  INTERVAL_ENUM_MEMBER_DOCS,
  PITCH_DISTRIBUTION_ENUM_DOCS,
  SCALE_TYPE_ENUM_DOCS,
} from './lib/core-ref-value-enums';

const ALEATORIC_ONLY_IMPORT = /import\s*\{[^}]+\}\s*from\s*['"]aleatoric['"]/;

function expectEnumDocsMatchExport(
  docs: readonly { value: string }[],
  exported: readonly string[],
) {
  expect(docs.length).toBe(exported.length);
  const docSet = new Set(docs.map((d) => d.value));
  for (const v of exported) {
    expect(docSet.has(v)).toBe(true);
  }
}

describe('Core API reference snippets', () => {
  it('every entry has a non-empty example importing only from aleatoric', () => {
    for (const cat of CORE_API_CATEGORIES) {
      for (const entry of cat.entries) {
        expect(entry.example.trim().length).toBeGreaterThan(0);
        expect(ALEATORIC_ONLY_IMPORT.test(entry.example)).toBe(true);
        const specs = entry.example.matchAll(/from\s+['"]([^'"]+)['"]/g);
        for (const m of specs) {
          expect(m[1]).toBe('aleatoric');
        }
      }
    }
  });

  it('snippet map keys match entry ids exactly', () => {
    const ids = new Set<string>(
      CORE_API_CATEGORIES.flatMap((c) => c.entries.map((e) => e.id)),
    );
    const snippetKeys = new Set(Object.keys(CORE_API_REFERENCE_SNIPPETS));
    expect(ids.size).toBe(snippetKeys.size);
    for (const id of ids) {
      expect(snippetKeys.has(id)).toBe(true);
    }
    for (const key of snippetKeys) {
      expect(ids.has(key)).toBe(true);
    }
  });

  it('shared ref-value enum docs match aleatoric exports (same members)', () => {
    expectEnumDocsMatchExport(SCALE_TYPE_ENUM_DOCS, SCALE_TYPE_NAMES);
    expectEnumDocsMatchExport(CHORD_QUALITY_ENUM_DOCS, CHORD_QUALITIES);
    expectEnumDocsMatchExport(DURATION_NAME_ENUM_DOCS, DURATION_NAMES);
    expectEnumDocsMatchExport(
      PITCH_DISTRIBUTION_ENUM_DOCS,
      PITCH_DISTRIBUTIONS,
    );
    expectEnumDocsMatchExport(CHANCE_METHOD_ENUM_DOCS, CHANCE_METHODS);
    expectEnumDocsMatchExport(
      CELLULAR_PITCH_MAPPING_ENUM_DOCS,
      CELLULAR_PITCH_MAPPING_KINDS,
    );
    expectEnumDocsMatchExport(INTERVAL_ENUM_MEMBER_DOCS, INTERVAL_ENUM_MEMBERS);
    expectEnumDocsMatchExport(CONTOUR_DIRECTION_ENUM_DOCS, CONTOUR_DIRECTIONS);
  });
});
