module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.test.ts',
    '!**/test/**',
    '!**/node_modules/**',
    '!**/*.module.ts', // Exclude module files from coverage
    '!**/main.ts', // Exclude main.ts from coverage
    '!**/app.module.ts', // Exclude app.module.ts from coverage
    '!**/prisma/**', // Exclude Prisma files from coverage
    '!**/dist/**', // Exclude dist files from coverage
    '!**/coverage/**', // Exclude coverage files from coverage
    '!**/*.dto.ts', // Exclude DTO files from coverage
    '!**/dto/**', // Exclude dto directories from coverage
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  // Exclude specific modules from tests
  testPathIgnorePatterns: [
    // Add patterns here to exclude specific modules
    // Examples:
    // '/node_modules/',
    // '/dist/',
    // '/coverage/',
    // '/src/specific-module/',
  ],
  // Alternative: Use testMatch to include only specific patterns
  // testMatch: [
  //   '**/__tests__/**/*.(t|j)s',
  //   '**/*.(test|spec).(t|j)s'
  // ],
};
