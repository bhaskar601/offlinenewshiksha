const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const APP_DATA_DIR = process.env.APP_DATA_DIR
  ? path.resolve(process.env.APP_DATA_DIR)
  : path.resolve(__dirname, "..");
const DATA_FILE = path.join(APP_DATA_DIR, "data.json");

const defaultData = {
  students: [],
  teachers: [],
  questions: [],
  quizzes: [],
  reports: [],
  schools: [],
  vocabularychapters: [],
};

function ensureDataFile() {
  if (!fs.existsSync(APP_DATA_DIR)) {
    fs.mkdirSync(APP_DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
    return;
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8").trim();
  if (!raw) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf-8");
  }
}

function readJSON() {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, "utf-8").trim();
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw);
    return { ...defaultData, ...parsed };
  } catch (error) {
    console.error("Failed reading data.json:", error);
    return { ...defaultData };
  }
}

function writeJSON(payload) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ ...defaultData, ...payload }, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed writing data.json:", error);
    return false;
  }
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function makeId(prefix = "id") {
  return `${prefix}_${crypto.randomUUID()}`;
}

module.exports = {
  readJSON,
  writeJSON,
  safeArray,
  makeId,
  ensureDataFile,
  DATA_FILE,
};
