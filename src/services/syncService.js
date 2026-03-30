import { SERVER_URL } from "../config";

const STORAGE_KEY = "cloudSyncQueue:v1";
const DEVICE_ID_KEY = "deviceId:v1";

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback (not RFC4122-perfect, but stable enough for unique IDs)
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function readQueue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { students: [], quizzes: [], attempts: [] };
    }
    const parsed = JSON.parse(raw);
    return {
      students: Array.isArray(parsed.students) ? parsed.students : [],
      quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
    };
  } catch {
    return { students: [], quizzes: [], attempts: [] };
  }
}

function writeQueue(queue) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

function withMeta(entity) {
  const out = { ...entity };
  if (!out.uniqueId) out.uniqueId = uuid();
  if (typeof out.synced !== "boolean") out.synced = false;
  if (!out.createdAt) out.createdAt = nowIso();
  return out;
}

export function enqueueEntity(type, entity) {
  const queue = readQueue();
  if (!queue[type]) throw new Error(`Unknown sync type: ${type}`);
  queue[type].push(withMeta(entity));
  writeQueue(queue);
}

export function getUnsyncedData() {
  const queue = readQueue();
  return {
    students: queue.students.filter((x) => !x.synced),
    quizzes: queue.quizzes.filter((x) => !x.synced),
    attempts: queue.attempts.filter((x) => !x.synced),
  };
}

export function markAsSynced({ students = [], quizzes = [], attempts = [] } = {}) {
  const queue = readQueue();
  const mark = (arr, ids) =>
    arr.map((x) => (ids.includes(x.uniqueId) ? { ...x, synced: true, syncedAt: nowIso() } : x));
  queue.students = mark(queue.students, students);
  queue.quizzes = mark(queue.quizzes, quizzes);
  queue.attempts = mark(queue.attempts, attempts);
  writeQueue(queue);
}

export async function syncToServer() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    const err = new Error("You are offline. Connect to internet to sync.");
    err.code = "OFFLINE";
    throw err;
  }

  const deviceId = getDeviceId();
  const data = getUnsyncedData();

  const total =
    data.students.length + data.quizzes.length + data.attempts.length;
  if (total === 0) {
    return { ok: true, synced: 0 };
  }

  const res = await fetch(`${SERVER_URL}/api/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deviceId, data }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(text || `Sync failed (${res.status})`);
    err.code = "SYNC_FAILED";
    throw err;
  }

  // Mark only what we actually sent
  markAsSynced({
    students: data.students.map((x) => x.uniqueId),
    quizzes: data.quizzes.map((x) => x.uniqueId),
    attempts: data.attempts.map((x) => x.uniqueId),
  });

  return { ok: true, synced: total };
}

