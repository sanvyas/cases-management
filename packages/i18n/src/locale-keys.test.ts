import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('locale key parity', () => {
  const en = JSON.parse(
    readFileSync(resolve(__dirname, '../locales/en.json'), 'utf-8'),
  ) as Record<string, string>;
  const hi = JSON.parse(
    readFileSync(resolve(__dirname, '../locales/hi.json'), 'utf-8'),
  ) as Record<string, string>;

  it('every English key exists in Hindi', () => {
    const enKeys = Object.keys(en);
    const hiKeys = new Set(Object.keys(hi));
    const missing = enKeys.filter((k) => !hiKeys.has(k));
    expect(missing).toEqual([]);
  });

  it('every Hindi key exists in English', () => {
    const hiKeys = Object.keys(hi);
    const enKeys = new Set(Object.keys(en));
    const extra = hiKeys.filter((k) => !enKeys.has(k));
    expect(extra).toEqual([]);
  });

  it('no empty values in English', () => {
    const emptyKeys = Object.entries(en)
      .filter(([, v]) => v.trim() === '')
      .map(([k]) => k);
    expect(emptyKeys).toEqual([]);
  });

  it('no empty values in Hindi', () => {
    const emptyKeys = Object.entries(hi)
      .filter(([, v]) => v.trim() === '')
      .map(([k]) => k);
    expect(emptyKeys).toEqual([]);
  });
});
