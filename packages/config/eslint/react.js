import base from './base.js';

export default [
  ...base,
  {
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXText[value=/[a-zA-Z]{2,}/]',
          message: 'No hard-coded text in JSX. Use i18n keys via useTranslation().',
        },
      ],
    },
  },
];
