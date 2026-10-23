import express from "express";
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

  return app;
}
