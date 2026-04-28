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
  ensureRecurringTasksVisible(req.user.id);
  const tasks = db
    .prepare(
      `SELECT id, title, description, domain, impact, kind, recurring_master_id AS recurringMasterId, recurring_instance_anchor AS recurringInstanceAnchor, duration_minutes AS durationMinutes, recurring_type AS recurringType, recurring_anchor AS recurringAnchor, recurring_lead_days AS recurringLeadDays, due_date AS dueDate, status, created_at AS createdAt, completed_at AS completedAt
       FROM tasks
       WHERE user_id = ?
         AND (kind = 'recurring_master' OR recurring_instance_anchor IS NULL OR recurring_instance_anchor <= ?)
       ORDER BY created_at DESC`,
    )
    .all(req.user.id, todayString());
  res.json({ tasks });
});

app.post("/api/tasks", requireAuth, (req, res) => {
  const task = sanitizeTaskInput(req.body, { allowDone: true });
  if (!task.title) {
    return res.status(400).json({ error: "title_required" });
  }

  if (task.recurringType !== "none") {
    const masterId = createRecurringMaster(req.user.id, task);
    return res.status(201).json({ task: getTaskById(req.user.id, masterId) });
  }

  const taskId = createSingleTask(req.user.id, task);
  res.status(201).json({ task: getTaskById(req.user.id, taskId) });
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

  if (existing.kind === "recurring_master") {
    const updatedMaster = updateRecurringMaster(req.user.id, existing, updates);
    return res.json({ task: updatedMaster });
  }

  db.prepare(
    `UPDATE tasks
     SET title = ?, description = ?, domain = ?, impact = ?, due_date = ?, status = ?, completed_at = ?, duration_minutes = ?, recurring_type = ?, recurring_anchor = ?, recurring_lead_days = ?
     WHERE id = ? AND user_id = ?`,
  ).run(
    updates.title || existing.title,
    updates.description ?? existing.description,
    updates.domain || existing.domain,
    updates.impact || existing.impact,
    updates.dueDate || existing.dueDate,
    nextStatus,
    nextCompletedAt,
    updates.durationMinutes || existing.durationMinutes || 30,
    updates.recurringType || existing.recurringType || "none",
    existing.recurringAnchor || null,
    existing.recurringLeadDays || 0,
    taskId,
    req.user.id,
  );

  if (existing.status !== "done" && nextStatus === "done") {
    createRecurringFollowUpFromInstance(req.user.id, {
      ...existing,
      ...updates,
      status: nextStatus,
      dueDate: updates.dueDate || existing.dueDate || todayString(),
      durationMinutes: updates.durationMinutes || existing.durationMinutes || 30,
    });
  }

  res.json({ task: getTaskById(req.user.id, taskId) });
});

app.delete("/api/tasks/:id", requireAuth, (req, res) => {
  const taskId = Number(req.params.id);
  const existing = getTaskById(req.user.id, taskId);
  if (!existing) {
    return res.status(404).json({ error: "task_not_found" });
  }

  if (existing.kind === "recurring_master") {
    db.prepare("DELETE FROM tasks WHERE user_id = ? AND (id = ? OR recurring_master_id = ?)").run(req.user.id, taskId, taskId);
  } else {
    db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(taskId, req.user.id);
  }
  res.status(204).end();
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
      kind TEXT NOT NULL DEFAULT 'task',
      recurring_master_id INTEGER,
      recurring_instance_anchor TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      recurring_type TEXT NOT NULL DEFAULT 'none',
      recurring_anchor TEXT,
      recurring_lead_days INTEGER NOT NULL DEFAULT 0,
      due_date TEXT,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      completed_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON tasks(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `);
  ensureColumn(database, "tasks", "duration_minutes", "INTEGER NOT NULL DEFAULT 30");
  ensureColumn(database, "tasks", "kind", "TEXT NOT NULL DEFAULT 'task'");
  ensureColumn(database, "tasks", "recurring_master_id", "INTEGER");
  ensureColumn(database, "tasks", "recurring_instance_anchor", "TEXT");
  ensureColumn(database, "tasks", "recurring_type", "TEXT NOT NULL DEFAULT 'none'");
  ensureColumn(database, "tasks", "recurring_anchor", "TEXT");
  ensureColumn(database, "tasks", "recurring_lead_days", "INTEGER NOT NULL DEFAULT 0");
  migrateLegacyRecurringTasks(database);
  database.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  return database;
}

function ensureColumn(database, tableName, columnName, columnDefinition) {
  const columns = database.prepare(`PRAGMA table_info(${tableName})`).all();
  if (!columns.some((column) => column.name === columnName)) {
    database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
  }
}

function migrateLegacyRecurringTasks(database) {
  const legacyTasks = database
    .prepare(
      `SELECT id, user_id AS userId, title, description, domain, impact, status, duration_minutes AS durationMinutes,
              recurring_type AS recurringType, recurring_anchor AS recurringAnchor, recurring_lead_days AS recurringLeadDays,
              due_date AS dueDate, created_at AS createdAt
       FROM tasks
       WHERE kind = 'task' AND recurring_type != 'none' AND recurring_master_id IS NULL`,
    )
    .all();

  const insertMaster = database.prepare(
    `INSERT INTO tasks (
      user_id, title, description, domain, impact, kind, duration_minutes, recurring_type, recurring_anchor,
      recurring_lead_days, due_date, status, created_at, completed_at
    )
    VALUES (?, ?, ?, ?, ?, 'recurring_master', ?, ?, ?, ?, ?, ?, ?, NULL)`,
  );

  const linkInstance = database.prepare(
    `UPDATE tasks
     SET recurring_master_id = ?, recurring_instance_anchor = ?
     WHERE id = ?`,
  );

  for (const task of legacyTasks) {
    const anchor = task.recurringAnchor || isoDateFromTimestamp(task.createdAt) || todayString();
    const masterStatus = task.status === "parked" ? "parked" : "active";
    const result = insertMaster.run(
      task.userId,
      task.title,
      task.description || "",
      task.domain,
      task.impact,
      task.durationMinutes || 30,
      task.recurringType,
      anchor,
      task.recurringLeadDays || dateDiffDays(anchor, task.dueDate || anchor),
      task.dueDate || anchor,
      masterStatus,
      task.createdAt,
    );
    linkInstance.run(Number(result.lastInsertRowid), anchor, task.id);
  }
}

function todayString() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function isoDateFromTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return todayString();
  return date.toISOString().slice(0, 10);
}

function dateDiffDays(fromDate, toDate) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function addDays(baseDate, days) {
  const date = new Date(baseDate);
  if (Number.isNaN(date.getTime())) return todayString();
  date.setDate(date.getDate() + Number(days || 0));
  return date.toISOString().slice(0, 10);
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
    durationMinutes: Math.max(5, Math.min(24 * 60, Number(body.durationMinutes) || 30)),
    recurringType: ["none", "daily", "weekly", "monthly"].includes(body.recurringType) ? body.recurringType : "none",
    dueDate: typeof body.dueDate === "string" ? body.dueDate : "",
    status,
  };
}

function getTaskById(userId, taskId) {
  return db
    .prepare(
      `SELECT id, title, description, domain, impact, kind, recurring_master_id AS recurringMasterId, recurring_instance_anchor AS recurringInstanceAnchor, duration_minutes AS durationMinutes, recurring_type AS recurringType, recurring_anchor AS recurringAnchor, recurring_lead_days AS recurringLeadDays, due_date AS dueDate, status, created_at AS createdAt, completed_at AS completedAt
       FROM tasks
       WHERE user_id = ? AND id = ?`,
    )
    .get(userId, taskId);
}

function createSingleTask(userId, task, overrides = {}) {
  const now = overrides.createdAt || Date.now();
  const result = db
    .prepare(
      `INSERT INTO tasks (
        user_id, title, description, domain, impact, kind, recurring_master_id, recurring_instance_anchor,
        duration_minutes, recurring_type, recurring_anchor, recurring_lead_days, due_date, status, created_at, completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      userId,
      task.title,
      task.description || "",
      task.domain,
      task.impact,
      overrides.kind || "task",
      overrides.recurringMasterId || null,
      overrides.recurringInstanceAnchor || null,
      task.durationMinutes || 30,
      task.recurringType || "none",
      overrides.recurringAnchor ?? null,
      overrides.recurringLeadDays || 0,
      overrides.dueDate ?? task.dueDate ?? "",
      overrides.status || task.status || "active",
      now,
      overrides.completedAt ?? (overrides.status === "done" ? now : null),
    );
  return Number(result.lastInsertRowid);
}

function createRecurringMaster(userId, task) {
  const now = Date.now();
  const anchor = isoDateFromTimestamp(now);
  const leadDays = dateDiffDays(anchor, task.dueDate || anchor);
  const masterStatus = task.status === "parked" ? "parked" : "active";
  const masterDueDate = addDays(anchor, leadDays);
  const masterId = createSingleTask(
    userId,
    { ...task, status: masterStatus },
    {
      kind: "recurring_master",
      recurringAnchor: anchor,
      recurringLeadDays: leadDays,
      dueDate: masterDueDate,
      status: masterStatus,
      createdAt: now,
    },
  );

  if (masterStatus === "active") {
    createRecurringInstance(userId, {
      ...task,
      recurringType: task.recurringType,
      recurringAnchor: anchor,
      recurringLeadDays: leadDays,
      recurringMasterId: masterId,
    }, anchor);
  }

  return masterId;
}

function createRecurringInstance(userId, masterTask, anchor) {
  const dueDate = addDays(anchor, masterTask.recurringLeadDays || 0);
  const instanceId = createSingleTask(
    userId,
    { ...masterTask, status: "active" },
    {
      recurringMasterId: masterTask.recurringMasterId || masterTask.id,
      recurringInstanceAnchor: anchor,
      recurringAnchor: masterTask.recurringAnchor || anchor,
      recurringLeadDays: masterTask.recurringLeadDays || 0,
      dueDate,
      status: "active",
    },
  );
  db.prepare(
    `UPDATE tasks
     SET due_date = ?
     WHERE user_id = ? AND id = ?`,
  ).run(dueDate, userId, masterTask.recurringMasterId || masterTask.id);
  return instanceId;
}

function updateRecurringMaster(userId, existing, updates) {
  const nextStatus = updates.status === "parked" ? "parked" : "active";
  const recurringType = updates.recurringType || existing.recurringType || "daily";
  const recurringAnchor = existing.recurringAnchor || isoDateFromTimestamp(existing.createdAt) || todayString();
  const dueDate = updates.dueDate || existing.dueDate || recurringAnchor;
  const recurringLeadDays = dateDiffDays(recurringAnchor, dueDate);

  db.prepare(
    `UPDATE tasks
     SET title = ?, description = ?, domain = ?, impact = ?, duration_minutes = ?, recurring_type = ?, recurring_anchor = ?, recurring_lead_days = ?, due_date = ?, status = ?
     WHERE id = ? AND user_id = ?`,
  ).run(
    updates.title || existing.title,
    updates.description ?? existing.description,
    updates.domain || existing.domain,
    updates.impact || existing.impact,
    updates.durationMinutes || existing.durationMinutes || 30,
    recurringType,
    recurringAnchor,
    recurringLeadDays,
    dueDate,
    nextStatus,
    existing.id,
    userId,
  );

  if (nextStatus === "active") {
    ensureRecurringInstanceForMaster(userId, {
      ...existing,
      ...updates,
      id: existing.id,
      recurringType,
      recurringAnchor,
      recurringLeadDays,
      durationMinutes: updates.durationMinutes || existing.durationMinutes || 30,
      title: updates.title || existing.title,
      description: updates.description ?? existing.description,
      domain: updates.domain || existing.domain,
      impact: updates.impact || existing.impact,
    });
  }

  return getTaskById(userId, existing.id);
}

function createRecurringFollowUpFromInstance(userId, task) {
  if (!task.recurringMasterId) return;
  const master = getTaskById(userId, task.recurringMasterId);
  if (!master || master.kind !== "recurring_master" || master.status !== "active" || !master.recurringType || master.recurringType === "none") {
    return;
  }
  const currentAnchor = task.recurringInstanceAnchor || task.recurringAnchor || isoDateFromTimestamp(task.createdAt) || todayString();
  const nextAnchor = nextRecurringDate(currentAnchor, master.recurringType);
  const exists = db
    .prepare(
      `SELECT id FROM tasks
       WHERE user_id = ? AND recurring_master_id = ? AND recurring_instance_anchor = ?
       LIMIT 1`,
    )
    .get(userId, master.id, nextAnchor);
  if (exists) return;
  createRecurringInstance(
    userId,
    { ...master, recurringMasterId: master.id },
    nextAnchor,
  );
}

function ensureRecurringInstanceForMaster(userId, master) {
  const latest = db
    .prepare(
      `SELECT recurring_instance_anchor AS recurringInstanceAnchor, status
       FROM tasks
       WHERE user_id = ? AND recurring_master_id = ?
       ORDER BY recurring_instance_anchor DESC, created_at DESC
       LIMIT 1`,
    )
    .get(userId, master.id);
  const nextAnchor = latest?.recurringInstanceAnchor
    ? (latest.status === "done" ? nextRecurringDate(latest.recurringInstanceAnchor, master.recurringType) : latest.recurringInstanceAnchor)
    : (master.recurringAnchor || todayString());
  const exists = db
    .prepare(
      `SELECT id FROM tasks
       WHERE user_id = ? AND recurring_master_id = ? AND recurring_instance_anchor = ? AND status != 'done'
       LIMIT 1`,
    )
    .get(userId, master.id, nextAnchor);
  if (!exists) {
    createRecurringInstance(userId, { ...master, recurringMasterId: master.id }, nextAnchor);
  }
}

function ensureRecurringTasksVisible(userId) {
  const masters = db
    .prepare(
      `SELECT id, title, description, domain, impact, status, duration_minutes AS durationMinutes, recurring_type AS recurringType, recurring_anchor AS recurringAnchor, recurring_lead_days AS recurringLeadDays, due_date AS dueDate, created_at AS createdAt
       FROM tasks
       WHERE user_id = ? AND kind = 'recurring_master' AND status = 'active' AND recurring_type != 'none'`,
    )
    .all(userId);

  for (const master of masters) {
    ensureRecurringInstanceForMaster(userId, master);
  }
}

function nextRecurringDate(baseDate, recurringType) {
  const date = new Date(baseDate);
  if (Number.isNaN(date.getTime())) return todayString();
  if (recurringType === "daily") {
    date.setDate(date.getDate() + 1);
  } else if (recurringType === "weekly") {
    date.setDate(date.getDate() + 7);
  } else if (recurringType === "monthly") {
    const targetDay = date.getDate();
    date.setMonth(date.getMonth() + 1, 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(targetDay, lastDay));
  }
  return date.toISOString().slice(0, 10);
}
