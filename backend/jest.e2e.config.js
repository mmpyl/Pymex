module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage-e2e',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/config/swagger.js',
    '!src/domains/MIGRATION_GUIDE.js'
  ],
  testMatch: ['**/__tests__/e2e/**/*.test.js', '**/*.e2e.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  moduleNameMapper: {
    '^../../config/database$': '<rootDir>/src/config/database.js',
    '^../config/database$': '<rootDir>/src/config/database.js'
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js']
};
