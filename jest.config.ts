/** @jest-config-loader ts-node */
import { defineConfig } from "jest";

export default defineConfig({
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleDirectories: ["node_modules", "<rootDir>"],
});
