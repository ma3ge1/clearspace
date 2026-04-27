const STORAGE_KEY = "klarraum-v1";

const defaultState = {
  settings: {
    energy: 2,
    focus: 2,
    timeWindow: 45,
    dayMode: "stabil",
  },
  tasks: [
    {
      id: crypto.randomUUID(),
      title: "Projektangebot beantworten",
      domain: "Arbeit",
      type: "task",
      impact: 3,
      urgency: 3,
      effort: 30,
      friction: 2,
      nextStep: "Mail öffnen und drei Kernpunkte als Antwort notieren.",
      status: "active",
      createdAt: Date.now() - 4000,
      completedAt: null,
    },
    {
      id: crypto.randomUUID(),
      title: "Arzttermin vereinbaren",
      domain: "Privat",
      type: "task",
      impact: 3,
      urgency: 2,
      effort: 15,
      friction: 1,
      nextStep: "Praxisnummer öffnen und direkt anrufen.",
      status: "active",
      createdAt: Date.now() - 3000,
      completedAt: null,
    },
    {
      id: crypto.randomUUID(),
      title: "Neue Produktidee für ADHS-Coach notieren",
      domain: "Idee",
      type: "idea",
      impact: 2,
      urgency: 1,
      effort: 10,
      friction: 1,
      nextStep: "Nur drei Stichworte festhalten.",
      status: "parked",
      createdAt: Date.now() - 2000,
      completedAt: null,
    },
  ],
};

const appState = loadState();
let activeFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const topThree = document.getElementById("topThree");
const focusAction = document.getElementById("focusAction");
const ideaList = document.getElementById("ideaList");
const doneList = document.getElementById("doneList");
const summaryGrid = document.getElementById("summaryGrid");
const supportNote = document.getElementById("supportNote");
const resetDayButton = document.getElementById("resetDayButton");

const energyLevel = document.getElementById("energyLevel");
const focusState = document.getElementById("focusState");
const timeWindow = document.getElementById("timeWindow");
const dayMode = document.getElementById("dayMode");

const inputMap = {
  energy: energyLevel,
  focus: focusState,
  timeWindow,
  dayMode,
};

const domainNextStep = {
  Arbeit: "Dokument oder Mail öffnen und den ersten konkreten Satz schreiben.",
  Privat: "Kontakt, App oder Website öffnen und die Handlung sofort starten.",
  Idee: "Nur den Kern notieren und nicht weiter ausbauen.",
};

const supportMessages = {
  chaos: "Heute ist ein Schutzmodus sinnvoll. Kleine, klare Aufgaben gewinnen vor grossen Baustellen.",
  stabil: "Heute darfst du Wirkung priorisieren, solange der Einstieg klein bleibt.",
  catchup: "Heute lohnt sich ein Mix aus einem wichtigen Thema und zwei schnellen Entlastungen.",
};

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return structuredClone(defaultState);
    }

    const parsed = JSON.parse(stored);
    return {
      settings: { ...defaultState.settings, ...parsed.settings },
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaultState.tasks,
    };
  } catch (error) {
    console.warn("State konnte nicht geladen werden:", error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function syncSettingsToInputs() {
  energyLevel.value = String(appState.settings.energy);
  focusState.value = String(appState.settings.focus);
  timeWindow.value = String(appState.settings.timeWindow);
  dayMode.value = appState.settings.dayMode;
}

function updateSettings() {
  appState.settings.energy = Number(energyLevel.value);
  appState.settings.focus = Number(focusState.value);
  appState.settings.timeWindow = Number(timeWindow.value);
  appState.settings.dayMode = dayMode.value;
  saveState();
  render();
}

function getActiveTasks() {
  return appState.tasks.filter((task) => task.status === "active");
}

function getParkedIdeas() {
  return appState.tasks.filter(
    (task) => task.status === "parked" || task.type === "idea",
  );
}

function getCompletedTasks() {
  return appState.tasks
    .filter((task) => task.status === "done")
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
}

function calculateScore(task) {
  const { energy, focus, timeWindow: availableTime, dayMode: mode } = appState.settings;
  const fitsTime = task.effort <= availableTime ? 3 : -2;
  const fitsEnergy = energy === 1 && task.effort > 30 ? -2 : energy === 3 ? 1 : 0;
  const fitsFocus = focus === 1 && task.friction > 2 ? -2 : focus === 3 ? 1 : 0;
  const modeModifier =
    mode === "chaos"
      ? task.effort <= 30
        ? 2
        : -2
      : mode === "catchup"
        ? task.urgency >= 2
          ? 1
          : 0
        : task.impact >= 3
          ? 1
          : 0;
  const ideaPenalty = task.type === "idea" ? -4 : 0;
  const frictionPenalty = task.friction === 3 ? -1 : 0;

  return (
    task.impact * 2 +
    task.urgency * 2 +
    fitsTime +
    fitsEnergy +
    fitsFocus +
    modeModifier +
    ideaPenalty +
    frictionPenalty
  );
}

function sortByPriority(tasks) {
  return [...tasks]
    .map((task) => ({ ...task, score: calculateScore(task) }))
    .sort((a, b) => b.score - a.score || a.effort - b.effort);
}

function createEmptyState(text) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = text;
  return empty;
}

function renderSummary() {
  const activeTasks = getActiveTasks();
  const topTasks = sortByPriority(activeTasks).slice(0, 3);
  const parkedIdeas = appState.tasks.filter((task) => task.status === "parked");
  const completed = getCompletedTasks();

  const cards = [
    { label: "Aktive Aufgaben", value: activeTasks.length, tone: "warm" },
    { label: "Top-3 heute", value: topTasks.length, tone: "green" },
    { label: "Geparkte Ideen", value: parkedIdeas.length, tone: "gold" },
    { label: "Erledigt", value: completed.length, tone: "ink" },
  ];

  summaryGrid.innerHTML = "";

  cards.forEach((card) => {
    const item = document.createElement("article");
    item.className = `summary-item tone-${card.tone}`;
    item.innerHTML = `
      <span>${card.label}</span>
      <strong>${card.value}</strong>
    `;
    summaryGrid.appendChild(item);
  });

  supportNote.textContent = supportMessages[appState.settings.dayMode];
}

function renderTopThree() {
  const ranked = sortByPriority(getActiveTasks()).slice(0, 3);
  topThree.innerHTML = "";

  if (!ranked.length) {
    topThree.appendChild(
      createEmptyState("Noch keine aktiven Aufgaben. Starte mit einem kurzen Brain Dump."),
    );
    return;
  }

  ranked.forEach((task, index) => {
    const item = document.createElement("article");
    item.className = "top-item";
    item.innerHTML = `
      <div class="top-rank">
        <span class="rank-number">${index + 1}</span>
        <span class="badge">${task.domain}</span>
      </div>
      <h3>${task.title}</h3>
      <p class="card-copy">Score ${task.score} · ${task.effort} Minuten · ${task.type === "worry" ? "offene Schleife" : "aktive Aufgabe"}</p>
      <p class="mini-step">${task.nextStep || domainNextStep[task.domain]}</p>
      <div class="action-row">
        <button class="secondary-button" type="button" data-action="done" data-id="${task.id}">
          Erledigt
        </button>
        <button class="secondary-button" type="button" data-action="park" data-id="${task.id}">
          Parken
        </button>
      </div>
    `;
    topThree.appendChild(item);
  });
}

function renderFocusAction() {
  const [nextTask] = sortByPriority(getActiveTasks());
  focusAction.innerHTML = "";

  if (!nextTask) {
    focusAction.appendChild(
      createEmptyState("Sobald eine Aufgabe aktiv ist, erscheint hier dein Einstieg."),
    );
    return;
  }

  const panel = document.createElement("article");
  panel.className = "focus-panel";
  panel.innerHTML = `
    <div class="focus-meta">
      <span class="badge">Jetzt anfangen mit</span>
      <span class="pill">${nextTask.effort} Minuten Block</span>
    </div>
    <h3>${nextTask.title}</h3>
    <p>${nextTask.nextStep || domainNextStep[nextTask.domain]}</p>
    <div class="focus-hint">
      ${appState.settings.dayMode === "chaos"
        ? "Wenn du blockierst: Stell einen 5-Minuten-Timer und erlaube dir, danach zu stoppen."
        : "Wenn du blockierst: Fang absichtlich unperfekt an und arbeite nur bis zum ersten Teilziel."}
    </div>
  `;
  focusAction.appendChild(panel);
}

function renderTaskList() {
  const activeTasks = getActiveTasks();
  const filtered =
    activeFilter === "all"
      ? activeTasks
      : activeTasks.filter((task) => task.domain === activeFilter);
  const ranked = sortByPriority(filtered);

  taskList.innerHTML = "";

  if (!ranked.length) {
    taskList.appendChild(createEmptyState("Keine Aufgaben in diesem Filter."));
    return;
  }

  ranked.forEach((task) => {
    const item = document.createElement("article");
    item.className = "task-item";
    item.innerHTML = `
      <div class="task-topline">
        <strong>${task.title}</strong>
        <span class="score">Score ${task.score}</span>
      </div>
      <div class="task-meta">
        <span class="badge">${task.domain}</span>
        <span class="pill">${formatType(task.type)}</span>
        <span class="pill">Wirkung ${task.impact}/3</span>
        <span class="pill">Dringlichkeit ${task.urgency}/3</span>
        <span class="pill">${task.effort} Min</span>
        <span class="pill">Start-Hürde ${task.friction}/3</span>
      </div>
      <p class="task-note">${task.nextStep || domainNextStep[task.domain]}</p>
      <div class="action-row">
        <button class="secondary-button" type="button" data-action="done" data-id="${task.id}">
          Erledigt
        </button>
        <button class="secondary-button" type="button" data-action="park" data-id="${task.id}">
          Parken
        </button>
        <button class="secondary-button" type="button" data-action="boost" data-id="${task.id}">
          Heute wichtiger
        </button>
      </div>
    `;
    taskList.appendChild(item);
  });
}

function renderIdeas() {
  const ideas = getParkedIdeas().sort((a, b) => b.createdAt - a.createdAt);
  ideaList.innerHTML = "";

  if (!ideas.length) {
    ideaList.appendChild(createEmptyState("Keine geparkten Ideen vorhanden."));
    return;
  }

  ideas.forEach((idea) => {
    const item = document.createElement("article");
    item.className = "stack-item";
    item.innerHTML = `
      <div class="task-topline">
        <strong>${idea.title}</strong>
        <span class="badge">${idea.domain}</span>
      </div>
      <p class="task-note">${idea.nextStep || "Idee bleibt geparkt, bis du bewusst Zeit dafür reservierst."}</p>
      <div class="action-row">
        <button class="secondary-button" type="button" data-action="activate" data-id="${idea.id}">
          Aktivieren
        </button>
      </div>
    `;
    ideaList.appendChild(item);
  });
}

function renderDone() {
  const completed = getCompletedTasks();
  doneList.innerHTML = "";

  if (!completed.length) {
    doneList.appendChild(createEmptyState("Noch nichts erledigt. Klein anfangen zählt."));
    return;
  }

  completed.forEach((task) => {
    const item = document.createElement("article");
    item.className = "stack-item done-item";
    item.innerHTML = `
      <div class="task-topline">
        <strong>${task.title}</strong>
        <span class="pill">${task.domain}</span>
      </div>
    `;
    doneList.appendChild(item);
  });
}

function renderFilterButtons() {
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === activeFilter);
  });
}

function render() {
  renderSummary();
  renderTopThree();
  renderFocusAction();
  renderTaskList();
  renderIdeas();
  renderDone();
  renderFilterButtons();
}

function formatType(type) {
  if (type === "idea") {
    return "Idee";
  }

  if (type === "worry") {
    return "Offene Schleife";
  }

  return "Aufgabe";
}

function addTask(event) {
  event.preventDefault();

  const titleInput = document.getElementById("taskTitle");
  const title = titleInput.value.trim();
  if (!title) {
    return;
  }

  const type = document.getElementById("taskType").value;
  const domain = document.getElementById("taskDomain").value;

  appState.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    domain,
    type,
    impact: Number(document.getElementById("taskImpact").value),
    urgency: Number(document.getElementById("taskUrgency").value),
    effort: Number(document.getElementById("taskEffort").value),
    friction: Number(document.getElementById("taskFriction").value),
    nextStep: document.getElementById("taskNextStep").value.trim(),
    status: type === "idea" ? "parked" : "active",
    createdAt: Date.now(),
    completedAt: null,
  });

  taskForm.reset();
  document.getElementById("taskImpact").value = "2";
  document.getElementById("taskUrgency").value = "2";
  document.getElementById("taskEffort").value = "30";
  document.getElementById("taskFriction").value = "2";
  document.getElementById("taskType").value = "task";
  document.getElementById("taskDomain").value = domain;

  saveState();
  render();
  titleInput.focus();
}

function updateTask(id, updates) {
  const task = appState.tasks.find((entry) => entry.id === id);
  if (!task) {
    return;
  }

  Object.assign(task, updates);
  saveState();
  render();
}

function handleActionClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const { action, id } = button.dataset;

  if (action === "done") {
    updateTask(id, { status: "done", completedAt: Date.now() });
    return;
  }

  if (action === "park") {
    updateTask(id, { status: "parked" });
    return;
  }

  if (action === "activate") {
    updateTask(id, { status: "active", type: "task", urgency: 2 });
    return;
  }

  if (action === "boost") {
    const task = appState.tasks.find((entry) => entry.id === id);
    if (!task) {
      return;
    }

    task.urgency = Math.min(3, task.urgency + 1);
    task.impact = Math.min(3, task.impact + (task.impact < 3 ? 1 : 0));
    saveState();
    render();
  }
}

function resetDay() {
  appState.settings = structuredClone(defaultState.settings);
  appState.tasks.forEach((task) => {
    if (task.status === "done") {
      task.status = "active";
      task.completedAt = null;
    }
  });
  syncSettingsToInputs();
  saveState();
  render();
}

taskForm.addEventListener("submit", addTask);
taskList.addEventListener("click", handleActionClick);
topThree.addEventListener("click", handleActionClick);
ideaList.addEventListener("click", handleActionClick);

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    render();
  });
});

Object.values(inputMap).forEach((input) => {
  input.addEventListener("change", updateSettings);
});

resetDayButton.addEventListener("click", resetDay);

syncSettingsToInputs();
render();
