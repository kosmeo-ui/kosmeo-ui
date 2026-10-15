import { env } from "@/config/env";

export const enableMocking = async () => {
  if (!env.ENABLE_API_MOCKING) return;
  const { worker } = await import("./browser");
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
};
