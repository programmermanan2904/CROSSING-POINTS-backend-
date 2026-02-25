/* ═══════════════════════════════════════════════
   memoryService.js
   Tracks session state + conversation memory
═══════════════════════════════════════════════ */

const sessionMemory = new Map();

/* ── DEFAULT STATE ────────────────────────────── */

const defaultState = () => ({
  // Shopping flow state machine
  state: "IDLE",
  actionType: null,
  productOptions: [],
  categoryOptions: [],
  selectedProduct: null,
  selectedCategory: null,
  metadata: {},

  // Conversation memory (new)
  userName: null,
  lastIntent: null,
  lastTopic: null,
  history: [], // { role: "user" | "bot", message, timestamp }
});

/* ── GET MEMORY ───────────────────────────────── */

export const getMemory = (userId) => {
  const key = userId.toString();

  if (!sessionMemory.has(key)) {
    sessionMemory.set(key, defaultState());
  }

  return sessionMemory.get(key);
};

/* ── UPDATE MEMORY ────────────────────────────── */

export const updateMemory = (userId, updates) => {
  const key = userId.toString();
  const current = getMemory(userId);

  sessionMemory.set(key, {
    ...current,
    ...updates,
  });
};

/* ── ADD TO HISTORY ───────────────────────────── */

export const addToHistory = (userId, role, message) => {
  const key = userId.toString();
  const memory = getMemory(userId);

  const updatedHistory = [
    ...memory.history,
    { role, message, timestamp: Date.now() },
  ];

  // Keep last 20 messages only
  if (updatedHistory.length > 20) {
    updatedHistory.shift();
  }

  sessionMemory.set(key, {
    ...memory,
    history: updatedHistory,
  });
};

/* ── GET HISTORY AS CONTEXT STRING ───────────── */

export const getHistoryContext = (userId) => {
  const memory = getMemory(userId);

  if (!memory.history.length) return "";

  return memory.history
    .slice(-6) // last 6 exchanges for context window
    .map(entry => `${entry.role === "user" ? "User" : "Veltrix"}: ${entry.message}`)
    .join("\n");
};

/* ── RESET MEMORY (keeps name, clears flow) ───── */

export const resetMemory = (userId) => {
  const key = userId.toString();
  const current = getMemory(userId);

  // Preserve name and history across flow resets
  sessionMemory.set(key, {
    ...defaultState(),
    userName: current.userName,
    history: current.history,
  });
};

/* ── CLEAR MEMORY (full wipe) ─────────────────── */

export const clearMemory = (userId) => {
  sessionMemory.delete(userId.toString());
};