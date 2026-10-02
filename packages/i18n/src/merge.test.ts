import { describe, it, expect } from 'vitest';

import { mergeVocabularyOverrides } from './index.js';

describe('mergeVocabularyOverrides', () => {
  it('merges overrides into base translations', () => {
    const base = {
      'geography.zone': 'Zone',
      'geography.ward': 'Ward',
      'geography.locality': 'Locality',
    };
    const overrides = {
      'geography.zone': 'Division',
      'geography.locality': 'Sector',
    };

    const result = mergeVocabularyOverrides(base, overrides);

    expect(result['geography.zone']).toBe('Division');
    expect(result['geography.ward']).toBe('Ward');
    expect(result['geography.locality']).toBe('Sector');
  });

  it('returns base when overrides are empty', () => {
    const base = { 'app.name': 'Samadhan' };
    const result = mergeVocabularyOverrides(base, {});
    expect(result).toEqual(base);
  });

  it('adds new keys from overrides', () => {
    const base = { 'app.name': 'Samadhan' };
    const overrides = { 'custom.label': 'Custom' };
    const result = mergeVocabularyOverrides(base, overrides);
    expect(result['custom.label']).toBe('Custom');
  });
});
