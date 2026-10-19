import { setupServer } from "msw/node";

/**
 * The fake network for every test. It starts with no handlers: a test declares
 * the endpoints it uses with `server.use(...)` (or `serve` in queryWrapper),
 * and any other request fails the test.
 */
export const server = setupServer();
