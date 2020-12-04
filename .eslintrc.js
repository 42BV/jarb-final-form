module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['@typescript-eslint', 'react', 'jest', 'prettier'],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    indent: 'off',
    '@typescript-eslint/indent': ['off', 0],
    'react/prop-types': [0], // Disable propTypes warning @see https://stackoverflow.com/questions/41746028/proptypes-in-a-typescript-react-application
    '@typescript-eslint/no-use-before-define': ['off'],
    'jest/prefer-expect-assertions': [
      'error',
      { onlyFunctionsWithAsyncKeyword: true }
    ]
  },
  settings: {
    react: {
      version: 'detect' // Tells eslint-plugin-react to automatically detect the version of React to use
    }
  }
};
