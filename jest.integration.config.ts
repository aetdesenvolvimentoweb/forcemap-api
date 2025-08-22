import baseConfig from "./jest.config";

export default {
  ...baseConfig,
  testMatch: ["**/__tests__/**/*.test.ts"],
};
