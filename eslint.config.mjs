import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'off',
      // This codebase's hydration-guard pattern (`useMounted()`, persisted
      // Zustand stores) intentionally sets state in a mount-only effect —
      // see README "Persisted state is hydration-guarded". Downgraded to
      // warn rather than rewritten wholesale as part of the Next 16 bump.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    ignores: ['src/generated/**'],
  },
];

export default eslintConfig;
