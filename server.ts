import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "data.json");

app.use(express.json({ limit: "50mb" }));

const API_ROUTES = ["/api/events", "/class/api/events.php", "/api/events.php"];

// API routes
app.get(API_ROUTES, async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch (error: any) {
    if (error.code === "ENOENT") {
      res.json([]);
    } else {
      res.status(500).json({ error: "Failed to read data" });
    }
  }
});

app.post(API_ROUTES, async (req, res) => {
  try {
    const events = req.body;
    await fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2), "utf-8");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save data" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
