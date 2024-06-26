import type { Config } from 'jest';

export default async (): Promise<Config> => {
  return {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.(spec|steps)\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['src/**/*.(t|j)s', '!src/**/*.spec.ts'],
    coverageReporters: ['text', 'lcov'],
    coverageDirectory: 'coverage',
    testEnvironment: 'node',
  };
};
