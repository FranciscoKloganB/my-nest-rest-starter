import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  coveragePathIgnorePatterns: [".module.ts$"],
  moduleFileExtensions: ["js", "json", "ts"],
  moduleNameMapper: {
    "@article/(.*)": "<rootDir>/src/article/$1",
    "@auth/(.*)": "<rootDir>/src/auth/$1",
    "@shared/(.*)": "<rootDir>/src/shared/$1",
    /**
     * Keep @src alias last so that IDEs/Editors provide better auto-completes.
     *
     * If @src comes first in this array IDE will match it as the de-facto alias for
     * auto-importing since all modules in `src` folder are a match for src/*.
     */
    "@src/(.*)": "<rootDir>/src/$1",

    "@user/(.*)": "<rootDir>/src/user/$1",
  },
  rootDir: ".",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  testEnvironment: "node",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes: ["TS151001"],
        },
        isolatedModules: true,
      },
    ],
  },
  verbose: true,
}

export default config
