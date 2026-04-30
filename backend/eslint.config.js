/**
 * ESLint Configuration for Backend (Flat Config - ESLint 9+)
 * Basado en buenas prácticas y estándares de la industria
 */

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'readonly',
        require: 'readonly'
      }
    },
    rules: {
      // ─── CALIDAD DE CÓDIGO ──────────────────────────────────────────────────
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_|^next$', 
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'no-unused-expressions': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-await': 'error',
      
      // ─── MEJORES PRÁCTICAS ──────────────────────────────────────────────────
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'curly': ['error', 'all'],
      'no-var': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-shadow': ['error', { builtinGlobals: false }],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      
      // ─── MANEJO DE ERRORES ──────────────────────────────────────────────────
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-promise-executor-return': 'error',
      
      // ─── ASINCRONÍA ─────────────────────────────────────────────────────────
      'require-await': 'warn',
      'no-async-promise-executor': 'error',
      
      // ─── ESTILO Y FORMATO ───────────────────────────────────────────────────
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'comma-dangle': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-before-function-paren': ['error', 'always'],
      'keyword-spacing': 'error',
      'space-infix-ops': 'error',
      'no-multi-spaces': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      
      // ─── SEGURIDAD ──────────────────────────────────────────────────────────
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  {
    // Configuración específica para tests
    files: ['**/__tests__/**/*.js', '**/*.test.js'],
    rules: {
      'no-console': 'off',
      'require-await': 'off'
    }
  }
];
