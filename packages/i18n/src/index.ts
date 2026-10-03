import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import i18next from 'i18next';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadLocale(lang: string): Record<string, string> {
  const content = readFileSync(resolve(__dirname, `../locales/${lang}.json`), 'utf-8');
  return JSON.parse(content) as Record<string, string>;
}

export function initI18n(language = 'en') {
  const en = loadLocale('en');
  const hi = loadLocale('hi');

  return i18next.init({
    lng: language,
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    interpolation: { escapeValue: false },
  });
}

export function mergeVocabularyOverrides(
  baseTranslations: Record<string, string>,
  overrides: Record<string, string>,
): Record<string, string> {
  return { ...baseTranslations, ...overrides };
}

export { i18next };
