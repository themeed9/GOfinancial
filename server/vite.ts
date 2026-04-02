import { type Express } from "express";
import { createServer as createViteServer } from "vite";
import type { Server } from "http";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

export async function setupVite(server: Server, app: Express) {
  const vite = await createViteServer({
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { server, path: "/vite-hmr" },
      allowedHosts: true,
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("/{*path}", async (req, res, next) => {
    const url = req.originalUrl;
    
    try {
      const clientTemplate = path.resolve(import.meta.dirname, "..", "..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
