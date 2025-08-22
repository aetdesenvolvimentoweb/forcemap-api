import baseConfig from "./jest.config";

export default {
  ...baseConfig,
  testMatch: ["**/__tests__/e2e/**/*.e2e.ts"],
  silent: false,
};
