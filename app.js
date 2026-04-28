const STORAGE_KEY = "mindfog-v4";
const DEFAULT_SECTION_ORDER = [
  "dashboardSection",
  "contextSection",
  "tasksSection",
  "parkedSection",
  "quickAddSection",
  "doneSection",
];

const translations = {
  de: {
    heroIntro: "Erfasse Tasks schnell, erkenne was heute zählt und mache Priorität sichtbar.",
    dashboardTitle: "Dashboard",
    resetDay: "Tag zurücksetzen",
    contextTitle: "Arbeitsmodus",
    contextCopy: "Der Modus verändert nur die Reihenfolge deiner Tasks.",
    modeLabel: "Modus",
    modeHint: "Welche Art von Sortierung brauchst du heute?",
    modeStable: "Stabiler Tag",
    modeStableDesc: "Tasks nach Fälligkeit anzeigen, älteste zuerst",
    modeCatchup: "Aufholen",
    modeCatchupDesc: "Überfällige und fällige Tasks zuerst anzeigen",
    modeChaos: "Überforderter Tag",
    modeChaosDesc: "Einfachere Tasks zuerst, ohne Fälligkeiten zu verlieren",
    createTitle: "Task erstellen",
    capturePrompt: "Was ist gerade in deinem Kopf?",
    descriptionLabel: "Beschreibung",
    domainLabel: "Bereich",
    domainWork: "Arbeit",
    domainPersonal: "Privat",
    domainOther: "Sonstiges",
    priorityLabel: "Priorität",
    dueDateLabel: "Fällig bis",
    statusLabel: "Status",
    statusOpen: "Offen",
    statusPark: "Parken",
    statusDone: "Erledigt",
    levelLow: "Niedrig",
    levelMedium: "Mittel",
    levelHigh: "Hoch",
    addButton: "Hinzufügen",
    cancelButton: "Abbrechen",
    saveButton: "Speichern",
    tasksTitle: "Tasks",
    tasksCopy: "Die wichtigsten Tasks stehen oben. Alles Weitere bleibt direkt darunter erreichbar.",
    dueTodayTitle: "Due today",
    showAllTasks: "Alle Tasks ansehen",
    hideAllTasks: "Zusätzliche Tasks ausblenden",
    parkedTitle: "Geparkte Tasks",
    quickAddTitle: "Task hinzufügen",
    quickAddCopy: "Erfasse schnell einen neuen Task direkt auf dem Board.",
    doneTitle: "Erledigt",
    doneAll: "Gesamt",
    doneToday: "Heute",
    doneWeek: "Diese Woche",
    summaryActive: "Aktive Tasks",
    summaryTop: "Due today",
    summaryParked: "Geparkte Tasks",
    pointsToday: "Today's score",
    pointsSuffix: "Punkte",
    scoreLabel: "Score",
    scoreExplainer:
      "Der Score ergibt sich aus Priorität und Fälligkeit. Höhere Priorität erhöht den Score deutlich, nahe oder überfällige Tasks bekommen zusätzliche Punkte.",
    scoreInfo:
      "Der Score kombiniert Priorität und Fälligkeit. Im Modus Überforderter Tag werden die kleinsten Scores zuerst gezeigt, damit du mit einfacheren Tasks starten kannst.",
    modeInfo:
      "Stabiler Tag sortiert nach Fälligkeit. Aufholen priorisiert zuerst Überfälliges und danach Fälliges. Überforderter Tag zeigt die einfachsten Tasks zuerst, berücksichtigt aber weiterhin Fälligkeiten.",
    supportStableTitle: "Heute zählt eine ruhige Standard-Sortierung",
    supportStableBody:
      "Mindfog zeigt deine Tasks in normaler Reihenfolge nach Fälligkeit, damit du strukturiert durch den Tag gehen kannst.",
    supportCatchupTitle: "Heute werden fällige Tasks nach vorne gezogen",
    supportCatchupBody:
      "Mindfog priorisiert zuerst überfällige Tasks und danach alle fälligen Tasks, jeweils mit älteren Daten zuerst.",
    supportChaosTitle: "Heute starten die einfachsten Tasks vorne",
    supportChaosBody:
      "Mindfog zeigt die kleinsten Scores zuerst und achtet trotzdem darauf, dass Überfälliges sichtbar bleibt.",
    topBadge: "Due today",
    topEmpty: "Noch keine aktiven Tasks vorhanden.",
    taskEmpty: "Noch keine weiteren aktiven Tasks vorhanden.",
    parkedEmpty: "Noch keine geparkten Tasks vorhanden.",
    doneEmpty: "Noch keine erledigten Tasks in dieser Ansicht.",
    doneOn: "Erledigt",
    reactivateButton: "Aktivieren",
    statusEdit: "Bearbeiten",
    editTitle: "Task bearbeiten",
    authTitle: "Bei Mindfog anmelden",
    authIntro: "Melde dich an, damit deine Tasks sicher gespeichert und auf allen Geräten verfügbar sind.",
    setupTitle: "Ersten Account erstellen",
    setupHint: "Nutze mindestens 8 Zeichen. Dies ist dein erster Mindfog-Account.",
    setupButton: "Account erstellen",
    loginTitle: "Anmelden",
    loginButton: "Einloggen",
    logoutButton: "Logout",
    usernameLabel: "Benutzername",
    passwordLabel: "Passwort",
    authErrorDefault: "Das hat gerade nicht funktioniert. Bitte prüfe deine Eingaben.",
    authErrorInvalid: "Benutzername oder Passwort sind nicht korrekt.",
    authErrorShortPassword: "Das Passwort sollte mindestens 8 Zeichen haben.",
    authErrorSetupDone: "Ein Account existiert bereits. Bitte melde dich an.",
    authErrorRequired: "Bitte fülle Benutzername und Passwort aus.",
  },
  en: {
    heroIntro: "Capture tasks quickly, see what matters today, and turn priority into momentum.",
    dashboardTitle: "Dashboard",
    resetDay: "Reset day",
    contextTitle: "Work mode",
    contextCopy: "Mode only changes the order of your tasks.",
    modeLabel: "Mode",
    modeHint: "What kind of ordering do you need today?",
    modeStable: "Stable day",
    modeStableDesc: "Show tasks by due date, oldest first",
    modeCatchup: "Catch-up",
    modeCatchupDesc: "Prioritize overdue and due tasks first",
    modeChaos: "Overloaded day",
    modeChaosDesc: "Show easier tasks first without losing due items",
    createTitle: "Create task",
    capturePrompt: "What is on your mind right now?",
    descriptionLabel: "Description",
    domainLabel: "Area",
    domainWork: "Work",
    domainPersonal: "Personal",
    domainOther: "Other",
    priorityLabel: "Priority",
    dueDateLabel: "Due date",
    statusLabel: "Status",
    statusOpen: "Open",
    statusPark: "Park",
    statusDone: "Done",
    levelLow: "Low",
    levelMedium: "Medium",
    levelHigh: "High",
    addButton: "Add",
    cancelButton: "Cancel",
    saveButton: "Save",
    tasksTitle: "Tasks",
    tasksCopy: "The most relevant tasks stay at the top. Everything else remains directly below.",
    dueTodayTitle: "Due today",
    showAllTasks: "Show all tasks",
    hideAllTasks: "Hide additional tasks",
    parkedTitle: "Parked tasks",
    quickAddTitle: "Add task",
    quickAddCopy: "Capture a new task directly on the board.",
    doneTitle: "Completed",
    doneAll: "All time",
    doneToday: "Today",
    doneWeek: "This week",
    summaryActive: "Active tasks",
    summaryTop: "Due today",
    summaryParked: "Parked tasks",
    pointsToday: "Today's score",
    pointsSuffix: "points",
    scoreLabel: "Score",
    scoreExplainer:
      "Score is based on priority and due date. Higher priority raises the score, and tasks that are due soon or overdue gain extra points.",
    scoreInfo:
      "Score combines priority and due date. In overloaded mode the smallest scores appear first so you can start with easier tasks.",
    modeInfo:
      "Stable day sorts by due date. Catch-up prioritizes overdue tasks first and then due tasks. Overloaded day shows the easiest tasks first while still respecting due items.",
    supportStableTitle: "Today follows a calm default ordering",
    supportStableBody:
      "Mindfog shows your tasks in a normal due-date order so you can move through the day in a structured way.",
    supportCatchupTitle: "Today due tasks move to the front",
    supportCatchupBody:
      "Mindfog prioritizes overdue tasks first and then due tasks, always with older dates first.",
    supportChaosTitle: "Today the easiest tasks come first",
    supportChaosBody:
      "Mindfog shows the smallest scores first while keeping overdue work visible.",
    topBadge: "Due today",
    topEmpty: "No active tasks yet.",
    taskEmpty: "No additional active tasks yet.",
    parkedEmpty: "No parked tasks yet.",
    doneEmpty: "No completed tasks in this view yet.",
    doneOn: "Completed",
    reactivateButton: "Activate",
    statusEdit: "Edit",
    editTitle: "Edit task",
    authTitle: "Sign in to Mindfog",
    authIntro: "Sign in so your tasks are stored securely and available across devices.",
    setupTitle: "Create the first account",
    setupHint: "Use at least 8 characters. This becomes your first Mindfog account.",
    setupButton: "Create account",
    loginTitle: "Sign in",
    loginButton: "Log in",
    logoutButton: "Logout",
    usernameLabel: "Username",
    passwordLabel: "Password",
    authErrorDefault: "That did not work. Please check your input.",
    authErrorInvalid: "Username or password is not correct.",
    authErrorShortPassword: "The password should be at least 8 characters long.",
    authErrorSetupDone: "An account already exists. Please sign in.",
    authErrorRequired: "Please fill in username and password.",
  },
};

const defaultState = {
  language: "de",
  settings: { dayMode: "stabil", sectionOrder: [...DEFAULT_SECTION_ORDER] },
  tasks: [],
};

const appState = loadState();
let doneFilter = "all";
let showAllTasks = false;
let currentUser = null;
let draggedSectionId = null;

const authShell = document.getElementById("authShell");
const authError = document.getElementById("authError");
const setupForm = document.getElementById("setupForm");
const loginForm = document.getElementById("loginForm");
const logoutButton = document.getElementById("logoutButton");
const summaryGrid = document.getElementById("summaryGrid");
const pointsGrid = document.getElementById("pointsGrid");
const supportNote = document.getElementById("supportNote");
const topTasks = document.getElementById("topTasks");
const allTasks = document.getElementById("allTasks");
const parkedList = document.getElementById("parkedList");
const quickAddForm = document.getElementById("quickAddForm");
const doneList = document.getElementById("doneList");
const createDialog = document.getElementById("createDialog");
const taskForm = document.getElementById("taskForm");
const editDialog = document.getElementById("editDialog");
const editForm = document.getElementById("editForm");
const tooltip = document.getElementById("tooltip");
const mainGrid = document.getElementById("mainGrid");

function t(key) {
  return translations[appState.language][key] || key;
}

function todayString() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return structuredClone(defaultState);
    const parsed = JSON.parse(stored);
    return {
      language: parsed.language || "de",
      settings: {
        ...defaultState.settings,
        ...parsed.settings,
        sectionOrder: sanitizeSectionOrder(parsed.settings?.sectionOrder),
      },
      tasks: [],
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  const payload = {
    language: appState.language,
    settings: {
      ...appState.settings,
      sectionOrder: sanitizeSectionOrder(appState.settings.sectionOrder),
    },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function sanitizeSectionOrder(order) {
  const candidate = Array.isArray(order) ? order.filter((id) => DEFAULT_SECTION_ORDER.includes(id)) : [];
  const merged = [...candidate];
  DEFAULT_SECTION_ORDER.forEach((id) => {
    if (!merged.includes(id)) merged.push(id);
  });
  return merged;
}

function setLanguage(language) {
  appState.language = language;
  document.documentElement.lang = language;
  saveState();
  applyTranslations();
  render();
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.title = "Mindfog";
  document.getElementById("langDe").classList.toggle("active", appState.language === "de");
  document.getElementById("langEn").classList.toggle("active", appState.language === "en");
}

function renderSectionOrder() {
  const order = sanitizeSectionOrder(appState.settings.sectionOrder);
  appState.settings.sectionOrder = order;
  order.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) mainGrid.appendChild(section);
  });
  const explainer = document.getElementById("scoreExplainer");
  if (explainer) mainGrid.appendChild(explainer);
}

function dueWeight(dueDate) {
  if (!dueDate) return 999999999;
  return new Date(dueDate).getTime();
}

function scoreTask(task) {
  let score = task.impact * 5;
  const dueDiff = Math.ceil((dueWeight(task.dueDate) - Date.now()) / 86400000);
  if (dueDiff <= 0) score += 8;
  else if (dueDiff <= 2) score += 5;
  else if (dueDiff <= 7) score += 2;
  return score;
}

function withScore(task) {
  return { ...task, score: scoreTask(task) };
}

function sortActiveTasks(tasks) {
  const mode = appState.settings.dayMode;
  if (mode === "catchup") {
    return [...tasks].sort((a, b) => dueWeight(a.dueDate) - dueWeight(b.dueDate) || a.createdAt - b.createdAt);
  }

  if (mode === "chaos") {
    return [...tasks].sort((a, b) => {
      const aOverdue = dueWeight(a.dueDate) < Date.now() ? -1000 : 0;
      const bOverdue = dueWeight(b.dueDate) < Date.now() ? -1000 : 0;
      return (a.score + aOverdue) - (b.score + bOverdue) || dueWeight(a.dueDate) - dueWeight(b.dueDate);
    });
  }

  return [...tasks].sort((a, b) => dueWeight(a.dueDate) - dueWeight(b.dueDate) || a.createdAt - b.createdAt);
}

function getTasksByStatus(status) {
  return appState.tasks.filter((task) => task.status === status).map(withScore);
}

function activeTasks() {
  return sortActiveTasks(getTasksByStatus("active"));
}

function topThreeTasks() {
  return activeTasks().slice(0, 3);
}

function remainingTasks() {
  return activeTasks().slice(3);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function scoreSumSince(timestamp) {
  return getTasksByStatus("done")
    .filter((task) => (task.completedAt || 0) >= timestamp)
    .reduce((sum, task) => sum + task.score, 0);
}

function createEmptyState(text) {
  const div = document.createElement("div");
  div.className = "empty-state";
  div.textContent = text;
  return div;
}

function renderDashboard() {
  const cards = [
    { label: t("summaryActive"), value: activeTasks().length, target: "tasksSection" },
    { label: t("summaryTop"), value: topThreeTasks().length, target: "tasksSection" },
    { label: t("summaryParked"), value: getTasksByStatus("parked").length, target: "parkedSection" },
    { label: t("pointsToday"), value: scoreSumSince(startOfToday()), suffix: t("pointsSuffix"), score: true },
  ];

  summaryGrid.innerHTML = "";
  cards.forEach((card) => {
    const isClickable = Boolean(card.target);
    const element = document.createElement(isClickable ? "button" : "article");
    if (isClickable) {
      element.type = "button";
      element.dataset.target = card.target;
    }
    element.className = `metric-card${card.score ? " score-card" : ""}`;
    element.innerHTML = `<span class="metric-label">${card.label}</span><strong>${card.value}</strong>${
      card.suffix ? `<small>${card.suffix}</small>` : ""
    }`;
    summaryGrid.appendChild(element);
  });

  pointsGrid.innerHTML = "";

  const copy = {
    stabil: { title: t("supportStableTitle"), body: t("supportStableBody"), tone: "support-stable" },
    catchup: { title: t("supportCatchupTitle"), body: t("supportCatchupBody"), tone: "support-catchup" },
    chaos: { title: t("supportChaosTitle"), body: t("supportChaosBody"), tone: "support-chaos" },
  }[appState.settings.dayMode];

  supportNote.className = `support-note ${copy.tone}`;
  supportNote.innerHTML = `<strong>${copy.title}</strong><p>${copy.body}</p>`;
}

function buildTaskCard(task, options = {}) {
  const { top = false, done = false, parked = false } = options;
  const article = document.createElement("article");
  article.className = `task-card${top ? " top-card" : ""}`;
  const dueText = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(appState.language === "de" ? "de-CH" : "en-US")
    : "";
  const description = task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : "";

  let actions = "";
  if (done) {
    actions = `<button class="action-button action-activate" type="button" data-action="activate" data-id="${task.id}">${t("reactivateButton")}</button>`;
  } else if (parked) {
    actions = `
      <button class="action-button action-activate" type="button" data-action="activate" data-id="${task.id}">${t("statusOpen")}</button>
      <button class="action-button action-edit" type="button" data-action="edit" data-id="${task.id}">${t("statusEdit")}</button>
    `;
  } else {
    actions = `
      <button class="action-button action-done" type="button" data-action="done" data-id="${task.id}">${t("statusDone")}</button>
      <button class="action-button action-park" type="button" data-action="park" data-id="${task.id}">${t("statusPark")}</button>
      <button class="action-button action-edit" type="button" data-action="edit" data-id="${task.id}">${t("statusEdit")}</button>
    `;
  }

  const detailParts = [];
  if (dueText) detailParts.push(`<span class="task-detail">${dueText}</span>`);
  if (done && task.completedAt) {
    detailParts.push(
      `<span class="task-detail">${t("doneOn")} ${new Date(task.completedAt).toLocaleDateString(appState.language === "de" ? "de-CH" : "en-US")}</span>`,
    );
  }

  article.innerHTML = `
    <div class="task-card-top">
      <div class="task-main">
        ${top ? `<span class="task-chip">${t("topBadge")}</span>` : ""}
        <strong>${escapeHtml(task.title)}</strong>
        ${description}
      </div>
    </div>
    <div class="task-card-bottom">
      <div class="task-details">${detailParts.join("")}</div>
      <div class="task-actions">
        <div class="score-pill">
          <small>${t("scoreLabel")}</small>
          <span class="score-value">+${task.score}</span>
        </div>
        ${actions}
      </div>
    </div>
  `;
  return article;
}

function renderTasks() {
  topTasks.innerHTML = "";
  allTasks.innerHTML = "";
  allTasks.classList.toggle("hidden-list", !showAllTasks);
  document.getElementById("showAllTasksButton").textContent = showAllTasks ? t("hideAllTasks") : t("showAllTasks");

  const top = topThreeTasks();
  const rest = remainingTasks();

  if (!top.length) topTasks.appendChild(createEmptyState(t("topEmpty")));
  else top.forEach((task) => topTasks.appendChild(buildTaskCard(task, { top: true })));

  if (!showAllTasks) return;
  if (!rest.length) allTasks.appendChild(createEmptyState(t("taskEmpty")));
  else rest.forEach((task) => allTasks.appendChild(buildTaskCard(task)));
}

function renderParked() {
  const parked = getTasksByStatus("parked");
  parkedList.innerHTML = "";
  if (!parked.length) {
    parkedList.appendChild(createEmptyState(t("parkedEmpty")));
    return;
  }
  parked.forEach((task) => parkedList.appendChild(buildTaskCard(task, { parked: true })));
}

function renderDone() {
  let done = getTasksByStatus("done").sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  if (doneFilter === "today") done = done.filter((task) => (task.completedAt || 0) >= startOfToday());
  if (doneFilter === "week") done = done.filter((task) => (task.completedAt || 0) >= startOfToday() - 6 * 86400000);
  doneList.innerHTML = "";
  if (!done.length) {
    doneList.appendChild(createEmptyState(t("doneEmpty")));
    return;
  }
  done.forEach((task) => doneList.appendChild(buildTaskCard(task, { done: true })));
}

function render() {
  renderSectionOrder();
  if (!currentUser) return;
  renderDashboard();
  renderTasks();
  renderParked();
  renderDone();
}

function setAuthenticatedState(user) {
  currentUser = user;
  document.querySelectorAll(".topbar, .main-grid, .fab").forEach((node) => {
    node.classList.toggle("hidden-auth", !user);
  });
  logoutButton.classList.toggle("hidden-auth", !user);
  authShell.classList.toggle("hidden-auth", Boolean(user));
  if (user) {
    authError.textContent = "";
  }
}

function showAuthMode(mode) {
  setupForm.classList.toggle("hidden-auth", mode !== "setup");
  loginForm.classList.toggle("hidden-auth", mode !== "login");
}

function showAuthError(key) {
  authError.textContent = t(key);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "same-origin",
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "request_failed");
    error.code = data.error || "request_failed";
    throw error;
  }
  return data;
}

async function refreshTasks() {
  const data = await api("/api/tasks");
  appState.tasks = Array.isArray(data.tasks) ? data.tasks : [];
  render();
}

async function bootstrapSession() {
  try {
    const session = await api("/api/session", { headers: {} });
    if (session.authenticated) {
      setAuthenticatedState(session.user);
      await refreshTasks();
      return;
    }
    setAuthenticatedState(null);
    showAuthMode(session.setupRequired ? "setup" : "login");
  } catch {
    setAuthenticatedState(null);
    showAuthMode("login");
    showAuthError("authErrorDefault");
  }
}

function statusFromValue(value) {
  if (value === "done") return "done";
  if (value === "parked") return "parked";
  return "active";
}

async function createTask(payload) {
  const data = await api("/api/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  appState.tasks.unshift(data.task);
  render();
}

async function patchTask(id, payload) {
  const data = await api(`/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  appState.tasks = appState.tasks.map((task) => (task.id === id ? data.task : task));
  render();
}

async function addTask(event) {
  event.preventDefault();
  const title = document.getElementById("taskTitle").value.trim();
  if (!title) return;

  await createTask({
    title,
    description: document.getElementById("taskDescription").value.trim(),
    domain: document.getElementById("taskDomain").value,
    impact: Number(document.getElementById("taskImpact").value),
    dueDate: document.getElementById("taskDueDate").value || todayString(),
    status: statusFromValue(document.getElementById("taskStatus").value),
  });

  taskForm.reset();
  document.getElementById("taskDueDate").value = todayString();
  document.getElementById("taskStatus").value = "active";
  createDialog.close();
}

async function addQuickTask(event) {
  event.preventDefault();
  const titleInput = document.getElementById("quickAddTitleInput");
  const title = titleInput.value.trim();
  if (!title) return;

  await createTask({
    title,
    description: document.getElementById("quickAddDescription").value.trim(),
    domain: "Other",
    impact: Number(document.getElementById("quickAddImpact").value),
    dueDate: document.getElementById("quickAddDueDate").value || todayString(),
    status: "active",
  });

  quickAddForm.reset();
  document.getElementById("quickAddDueDate").value = todayString();
}

function openEditDialog(id) {
  const task = appState.tasks.find((entry) => entry.id === id);
  if (!task) return;
  document.getElementById("editTaskId").value = task.id;
  document.getElementById("editTaskTitle").value = task.title;
  document.getElementById("editTaskDescription").value = task.description || "";
  document.getElementById("editTaskDomain").value = task.domain;
  document.getElementById("editTaskImpact").value = String(task.impact);
  document.getElementById("editTaskDueDate").value = task.dueDate || todayString();
  document.getElementById("editTaskStatus").value = task.status;
  editDialog.showModal();
}

async function handleActionClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  const taskId = Number(id);
  if (action === "done") await patchTask(taskId, { status: "done" });
  if (action === "park") await patchTask(taskId, { status: "parked" });
  if (action === "activate") await patchTask(taskId, { status: "active" });
  if (action === "edit") openEditDialog(taskId);
}

function showTooltip(event, text) {
  tooltip.textContent = text;
  tooltip.classList.add("visible");
  const rect = event.currentTarget.getBoundingClientRect();
  tooltip.style.left = `${Math.max(16, rect.left + window.scrollX - 110)}px`;
  tooltip.style.top = `${rect.bottom + window.scrollY + 10}px`;
}

function hideTooltip() {
  tooltip.classList.remove("visible");
}

function reorderSections(sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const order = sanitizeSectionOrder(appState.settings.sectionOrder);
  const sourceIndex = order.indexOf(sourceId);
  const targetIndex = order.indexOf(targetId);
  if (sourceIndex === -1 || targetIndex === -1) return;
  const [moved] = order.splice(sourceIndex, 1);
  order.splice(targetIndex, 0, moved);
  appState.settings.sectionOrder = order;
  saveState();
  renderSectionOrder();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

setupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("setupUsername").value.trim();
  const password = document.getElementById("setupPassword").value;
  if (!username || !password) return showAuthError("authErrorRequired");
  if (password.length < 8) return showAuthError("authErrorShortPassword");

  try {
    const data = await api("/api/setup", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setAuthenticatedState(data.user);
    await refreshTasks();
  } catch (error) {
    showAuthError(error.code === "setup_already_completed" ? "authErrorSetupDone" : "authErrorDefault");
    showAuthMode("login");
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  if (!username || !password) return showAuthError("authErrorRequired");

  try {
    const data = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setAuthenticatedState(data.user);
    await refreshTasks();
  } catch {
    showAuthError("authErrorInvalid");
  }
});

logoutButton.addEventListener("click", async () => {
  try {
    await api("/api/logout", { method: "POST" });
  } finally {
    currentUser = null;
    appState.tasks = [];
    setAuthenticatedState(null);
    showAuthMode("login");
  }
});

taskForm.addEventListener("submit", (event) => addTask(event).catch(() => {}));
quickAddForm.addEventListener("submit", (event) => addQuickTask(event).catch(() => {}));
topTasks.addEventListener("click", (event) => handleActionClick(event).catch(() => {}));
allTasks.addEventListener("click", (event) => handleActionClick(event).catch(() => {}));
parkedList.addEventListener("click", (event) => handleActionClick(event).catch(() => {}));
doneList.addEventListener("click", (event) => handleActionClick(event).catch(() => {}));

document.getElementById("openCreateDialogButton").addEventListener("click", () => {
  document.getElementById("taskDueDate").value = todayString();
  createDialog.showModal();
});
document.getElementById("closeCreateDialog").addEventListener("click", () => createDialog.close());
document.getElementById("closeCreateDialogTop").addEventListener("click", () => createDialog.close());
createDialog.addEventListener("click", (event) => {
  const rect = createDialog.getBoundingClientRect();
  const inside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
  if (!inside) {
    createDialog.close();
  }
});

document.getElementById("showAllTasksButton").addEventListener("click", () => {
  showAllTasks = !showAllTasks;
  renderTasks();
});

summaryGrid.addEventListener("click", (event) => {
  const target = event.target.closest("[data-target]");
  if (!target) return;
  document.getElementById(target.dataset.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll('input[name="dayMode"]').forEach((input) => {
  input.addEventListener("change", () => {
    appState.settings.dayMode = input.value;
    saveState();
    render();
  });
});

document.querySelectorAll("[data-done-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    doneFilter = button.dataset.doneFilter;
    document.querySelectorAll("[data-done-filter]").forEach((item) => item.classList.toggle("active", item === button));
    renderDone();
  });
});

document.getElementById("resetDayButton").addEventListener("click", () => {
  appState.settings.dayMode = defaultState.settings.dayMode;
  document.querySelector(`input[name="dayMode"][value="${appState.settings.dayMode}"]`).checked = true;
  saveState();
  render();
});

document.getElementById("langDe").addEventListener("click", () => setLanguage("de"));
document.getElementById("langEn").addEventListener("click", () => setLanguage("en"));

document.querySelectorAll("[data-tooltip-key]").forEach((button) => {
  button.addEventListener("mouseenter", (event) => showTooltip(event, t(button.dataset.tooltipKey)));
  button.addEventListener("focus", (event) => showTooltip(event, t(button.dataset.tooltipKey)));
  button.addEventListener("mouseleave", hideTooltip);
  button.addEventListener("blur", hideTooltip);
});

document.querySelectorAll("[data-drag-handle]").forEach((handle) => {
  handle.addEventListener("dragstart", (event) => {
    const section = event.currentTarget.closest("[data-section-id]");
    if (!section) return;
    draggedSectionId = section.dataset.sectionId;
    section.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedSectionId);
  });

  handle.addEventListener("dragend", (event) => {
    draggedSectionId = null;
    event.currentTarget.closest("[data-section-id]")?.classList.remove("is-dragging");
    document.querySelectorAll(".drag-over").forEach((node) => node.classList.remove("drag-over"));
  });
});

document.querySelectorAll(".reorderable-section").forEach((section) => {
  section.addEventListener("dragover", (event) => {
    if (!draggedSectionId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    document.querySelectorAll(".drag-over").forEach((node) => {
      if (node !== section) node.classList.remove("drag-over");
    });
    section.classList.add("drag-over");
  });

  section.addEventListener("dragleave", () => {
    section.classList.remove("drag-over");
  });

  section.addEventListener("drop", (event) => {
    event.preventDefault();
    section.classList.remove("drag-over");
    reorderSections(draggedSectionId, section.dataset.sectionId);
  });
});

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const taskId = Number(document.getElementById("editTaskId").value);
  await patchTask(taskId, {
    title: document.getElementById("editTaskTitle").value.trim(),
    description: document.getElementById("editTaskDescription").value.trim(),
    domain: document.getElementById("editTaskDomain").value,
    impact: Number(document.getElementById("editTaskImpact").value),
    dueDate: document.getElementById("editTaskDueDate").value || todayString(),
    status: statusFromValue(document.getElementById("editTaskStatus").value),
  });
  editDialog.close();
});

document.getElementById("closeEditDialog").addEventListener("click", () => editDialog.close());

document.querySelector(`input[name="dayMode"][value="${appState.settings.dayMode}"]`).checked = true;
document.getElementById("taskDueDate").value = todayString();
document.getElementById("taskStatus").value = "active";
document.getElementById("quickAddDueDate").value = todayString();
applyTranslations();
renderSectionOrder();
setAuthenticatedState(null);
bootstrapSession();
