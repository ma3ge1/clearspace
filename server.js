const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { DatabaseSync } = require("node:sqlite");

const PORT = Number(process.env.PORT || 4173);
const COOKIE_NAME = "mindfog_session";
const SESSION_AGE_MS = 1000 * 60 * 60 * 24 * 14;
const DB_PATH = process.env.MINFOG_DB_PATH || path.join(__dirname, "data", "mindfog.sqlite");

const app = express();
const db = openDatabase(DB_PATH);

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/session", (req, res) => {
  const token = getSessionToken(req);
  const session = token ? findSession(token) : null;
  if (!session) {
    return res.json({ authenticated: false, setupRequired: userCount() === 0 });
  }

  touchSession(token);
  return res.json({
    authenticated: true,
    setupRequired: false,
    user: { id: session.user_id, username: session.username },
  });
});

app.post("/api/setup", (req, res) => {
  if (userCount() > 0) {
    return res.status(409).json({ error: "setup_already_completed" });
  }

  const username = normalizeUsername(req.body?.username);
  const password = String(req.body?.password || "");
  if (!username || password.length < 8) {
    return res.status(400).json({ error: "invalid_credentials" });
  }

  const userId = createUser(username, password);
  const session = createSession(userId);
  setSessionCookie(res, session.token);
  res.status(201).json({
    authenticated: true,
    user: { id: userId, username },
  });
});

app.post("/api/login", (req, res) => {
  const username = normalizeUsername(req.body?.username);
  const password = String(req.body?.password || "");
  const user = getUserByUsername(username);
  if (!user || !verifyPassword(password, user.password_hash, user.password_salt)) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const session = createSession(user.id);
  setSessionCookie(res, session.token);
  res.json({
    authenticated: true,
    user: { id: user.id, username: user.username },
  });
});

app.post("/api/logout", requireAuth, (req, res) => {
  const token = getSessionToken(req);
  if (token) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  }
  clearSessionCookie(res);
  res.status(204).end();
});

app.get("/api/tasks", requireAuth, (req, res) => {
  const tasks = db
    .prepare(
      `SELECT id, title, description, domain, impact, due_date AS dueDate, status, created_at AS createdAt, completed_at AS completedAt
       FROM tasks
       WHERE user_id = ?
       ORDER BY created_at DESC`,
    )
    .all(req.user.id);
  res.json({ tasks });
});

app.post("/api/tasks", requireAuth, (req, res) => {
  const task = sanitizeTaskInput(req.body, { allowDone: true });
  if (!task.title) {
    return res.status(400).json({ error: "title_required" });
  }

  const now = Date.now();
  const result = db
    .prepare(
      `INSERT INTO tasks (user_id, title, description, domain, impact, due_date, status, created_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      req.user.id,
      task.title,
      task.description,
      task.domain,
      task.impact,
      task.dueDate,
      task.status,
      now,
      task.status === "done" ? now : null,
    );

  res.status(201).json({ task: getTaskById(req.user.id, Number(result.lastInsertRowid)) });
});

app.patch("/api/tasks/:id", requireAuth, (req, res) => {
  const taskId = Number(req.params.id);
  const existing = getTaskById(req.user.id, taskId);
  if (!existing) {
    return res.status(404).json({ error: "task_not_found" });
  }

  const updates = sanitizeTaskInput(req.body, { allowDone: true });
  const nextStatus = updates.status || existing.status;
  const nextCompletedAt =
    nextStatus === "done"
      ? existing.completedAt || Date.now()
      : null;

  db.prepare(
    `UPDATE tasks
     SET title = ?, description = ?, domain = ?, impact = ?, due_date = ?, status = ?, completed_at = ?
     WHERE id = ? AND user_id = ?`,
  ).run(
    updates.title || existing.title,
    updates.description ?? existing.description,
    updates.domain || existing.domain,
    updates.impact || existing.impact,
    updates.dueDate || existing.dueDate,
    nextStatus,
    nextCompletedAt,
    taskId,
    req.user.id,
  );

  res.json({ task: getTaskById(req.user.id, taskId) });
});

const server = app.listen(PORT, () => {
  console.log(`Mindfog listening on http://localhost:${PORT}`);
});

server.on("close", () => {
  console.log("Mindfog server closed");
});

process.on("beforeExit", (code) => {
  console.log(`Mindfog beforeExit:${code}`);
});

process.on("exit", (code) => {
  console.log(`Mindfog exit:${code}`);
});

const keepAliveInterval = setInterval(() => {}, 60_000);

function shutdown() {
  clearInterval(keepAliveInterval);
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function requireAuth(req, res, next) {
  const token = getSessionToken(req);
  const session = token ? findSession(token) : null;
  if (!session) {
    clearSessionCookie(res);
    return res.status(401).json({ error: "authentication_required" });
  }
  touchSession(token);
  req.user = { id: session.user_id, username: session.username };
  next();
}

function openDatabase(filename) {
  const fs = require("fs");
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const database = new DatabaseSync(filename);
  database.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      domain TEXT NOT NULL,
      impact INTEGER NOT NULL,
      due_date TEXT,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      completed_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON tasks(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `);
  database.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  return database;
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, hash, salt) {
  const comparison = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), comparison);
}

function createUser(username, password) {
  const { salt, hash } = hashPassword(password);
  const result = db
    .prepare("INSERT INTO users (username, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?)")
    .run(username, hash, salt, Date.now());
  return Number(result.lastInsertRowid);
}

function getUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

function userCount() {
  const row = db.prepare("SELECT COUNT(*) AS count FROM users").get();
  return Number(row.count || 0);
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  db.prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").run(
    token,
    userId,
    now,
    now + SESSION_AGE_MS,
  );
  return { token };
}

function findSession(token) {
  return db
    .prepare(
      `SELECT sessions.token, sessions.user_id, sessions.expires_at, users.username
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token = ? AND sessions.expires_at >= ?`,
    )
    .get(token, Date.now());
}

function touchSession(token) {
  db.prepare("UPDATE sessions SET expires_at = ? WHERE token = ?").run(Date.now() + SESSION_AGE_MS, token);
}

function getSessionToken(req) {
  const cookieHeader = req.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...rest] = part.split("=");
        return [key, decodeURIComponent(rest.join("="))];
      }),
  );
  return cookies[COOKIE_NAME] || null;
}

function setSessionCookie(res, token) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${Math.floor(SESSION_AGE_MS / 1000)}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
}

function sanitizeTaskInput(input, options = {}) {
  const body = input && typeof input === "object" ? input : {};
  const allowedStatuses = options.allowDone ? ["active", "parked", "done"] : ["active", "parked"];
  const status = allowedStatuses.includes(body.status) ? body.status : "active";
  const impact = [1, 2, 3].includes(Number(body.impact)) ? Number(body.impact) : 2;
  const domain = ["Work", "Personal", "Other"].includes(body.domain) ? body.domain : "Other";

  return {
    title: String(body.title || "").trim(),
    description: typeof body.description === "string" ? body.description.trim() : "",
    domain,
    impact,
    dueDate: typeof body.dueDate === "string" ? body.dueDate : "",
    status,
  };
}

function getTaskById(userId, taskId) {
  return db
    .prepare(
      `SELECT id, title, description, domain, impact, due_date AS dueDate, status, created_at AS createdAt, completed_at AS completedAt
       FROM tasks
       WHERE user_id = ? AND id = ?`,
    )
    .get(userId, taskId);
}
