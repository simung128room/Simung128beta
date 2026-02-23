import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const db = new Database("workout.db");

  // Initialize DB
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      isAdmin INTEGER DEFAULT 0,
      isBanned INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      rewardExp INTEGER,
      rewardPoints INTEGER,
      type TEXT,
      isCompleted INTEGER DEFAULT 0
    );
  `);

  // Seed Admin
  const adminUsername = "ooD7822429";
  const existingAdmin = db.prepare("SELECT * FROM users WHERE username = ?").get(adminUsername);
  if (!existingAdmin) {
    db.prepare("INSERT INTO users (id, username, email, password, isAdmin) VALUES (?, ?, ?, ?, ?)")
      .run("admin-id", adminUsername, "admin@airse.ai", "admin-pass", 1);
  }

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/register", (req, res) => {
    const { username, email, password } = req.body;
    try {
      const id = Math.random().toString(36).substr(2, 9);
      db.prepare("INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)")
        .run(id, username, email, password);
      res.json({ id, username, email, isAdmin: false, isBanned: false });
    } catch (err: any) {
      res.status(400).json({ error: "User already exists or invalid data" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? OR username = ?").get(email, email) as any;
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: "Your account has been banned by the System." });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: !!user.isAdmin,
      isBanned: !!user.isBanned
    });
  });

  app.get("/api/auth/me", (req, res) => {
    const userId = req.query.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const user = db.prepare("SELECT id, username, email, isAdmin, isBanned FROM users WHERE id = ?").get(userId) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.isBanned) return res.status(403).json({ error: "Banned" });
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: !!user.isAdmin,
      isBanned: !!user.isBanned
    });
  });

  // API Routes
  app.get("/api/quests", (req, res) => {
    const quests = db.prepare("SELECT * FROM quests").all();
    res.json(quests.map((q: any) => ({ ...q, isCompleted: !!q.isCompleted })));
  });

  app.post("/api/quests", (req, res) => {
    const { title, description, rewardExp, rewardPoints, type, username } = req.body;
    if (username !== adminUsername) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare("INSERT INTO quests (id, title, description, rewardExp, rewardPoints, type) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, title, description, rewardExp, rewardPoints, type);
    res.json({ id, title, description, rewardExp, rewardPoints, type, isCompleted: false });
  });

  app.delete("/api/quests/:id", (req, res) => {
    const { username } = req.query;
    if (username !== adminUsername) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    db.prepare("DELETE FROM quests WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // God-level Admin Routes
  app.get("/api/admin/users", (req, res) => {
    const { username } = req.query;
    if (username !== adminUsername) return res.status(403).json({ error: "Unauthorized" });
    const users = db.prepare("SELECT id, username, email, isAdmin, isBanned FROM users").all();
    res.json(users);
  });

  app.post("/api/admin/users/:id/toggle-ban", (req, res) => {
    const { username } = req.body;
    if (username !== adminUsername) return res.status(403).json({ error: "Unauthorized" });
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.username === adminUsername) return res.status(400).json({ error: "Cannot ban admin" });
    
    const newBanStatus = user.isBanned ? 0 : 1;
    db.prepare("UPDATE users SET isBanned = ? WHERE id = ?").run(newBanStatus, req.params.id);
    res.json({ success: true, isBanned: !!newBanStatus });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
