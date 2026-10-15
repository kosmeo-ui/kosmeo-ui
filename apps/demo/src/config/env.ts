// The demo has no backend, so mocking is on unless explicitly turned off.
export const env = {
  API_URL: import.meta.env.VITE_APP_API_URL ?? "/api",
  ENABLE_API_MOCKING: import.meta.env.VITE_APP_ENABLE_API_MOCKING !== "false",
};
