module.exports = {
  name: 'Odal',
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 80,
  //     lines: 80
  //   }
  // },
  testPathIgnorePatterns: ['src/__tests__/registry/']
};
