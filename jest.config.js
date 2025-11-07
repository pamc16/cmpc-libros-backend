// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  roots: ['<rootDir>/src'],
  testRegex: '.spec.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  moduleNameMapper: {
  '^src/(.*)$': '<rootDir>/src/$1'
},
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',

};
