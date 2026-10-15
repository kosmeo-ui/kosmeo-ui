import { delay } from "msw";

export const networkDelay = () => delay(250 + Math.random() * 350);

export const getPath = (obj: object, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>(
      (value, key) => (value as Record<string, unknown> | undefined)?.[key],
      obj
    );
