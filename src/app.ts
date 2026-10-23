import express, { type ErrorRequestHandler } from "express";
import { CartError } from "./store.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cartsRouter } from "./routes/carts.js";
import { booksRouter } from "./routes/books.js";
import { healthRouter } from "./routes/health.js";

/**
 * Build the Express app WITHOUT starting a listener, so tests can import it
 * and drive it with Supertest. server.ts is the only place that calls listen().
 */
export function createApp() {
  const app = express();
  app.use(express.json());

  // API routes.
  app.use(booksRouter);
  app.use(cartsRouter);
  app.use(healthRouter);

  // Static storefront (public/index.html, app.js, styles.css).
  const here = dirname(fileURLToPath(import.meta.url));
  const publicDir = join(here, "..", "public");
  app.use(express.static(publicDir));

  // Anything under /api that didn't match above is a JSON 404.
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  const jsonErrors: ErrorRequestHandler = (error: unknown, _req, res, next) => {
    if (error instanceof CartError) {
      res.status(error.status).json({ error: error.message });
    } else if (
      error instanceof SyntaxError &&
      "type" in error &&
      error.type === "entity.parse.failed"
    ) {
      res.status(400).json({ error: "Invalid JSON body" });
    } else {
      next(error);
    }
  };
  app.use(jsonErrors);

  return app;
}
