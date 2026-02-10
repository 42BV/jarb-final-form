import pluginPrettier from 'eslint-config-prettier';
import pluginVitest from '@vitest/eslint-plugin';
import pluginReact from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  pluginVitest.configs.recommended,
  pluginPrettier,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2024,
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
);
