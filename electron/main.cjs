const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

let backendServer = null;

function logMain(message) {
  try {
    const logFile = path.join(app.getPath("userData"), "main.log");
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`, "utf-8");
  } catch (_err) {
    // ignore logging failures
  }
}

function getBackendPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "app.asar", "backend", "index.js");
  }
  return path.join(__dirname, "../backend/index.js");
}

function getBundledDataPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "app.asar", "backend", "data.json");
  }
  return path.join(__dirname, "../backend/data.json");
}

function prepareRuntimeDataDirectory() {
  const runtimeDir = path.join(app.getPath("userData"), "backend-data");
  const runtimeDataFile = path.join(runtimeDir, "data.json");
  const seedHashFile = path.join(runtimeDir, ".seed-hash");
  const bundledDataFile = getBundledDataPath();

  if (!fs.existsSync(runtimeDir)) {
    fs.mkdirSync(runtimeDir, { recursive: true });
  }

  const runtimeMissingOrEmpty =
    !fs.existsSync(runtimeDataFile) || fs.readFileSync(runtimeDataFile, "utf-8").trim() === "";

  if (fs.existsSync(bundledDataFile)) {
    const bundledRaw = fs.readFileSync(bundledDataFile, "utf-8");
    const bundledHash = crypto.createHash("sha256").update(bundledRaw).digest("hex");
    const currentSeedHash = fs.existsSync(seedHashFile) ? fs.readFileSync(seedHashFile, "utf-8").trim() : "";

    if (runtimeMissingOrEmpty || bundledHash !== currentSeedHash) {
      fs.copyFileSync(bundledDataFile, runtimeDataFile);
      fs.writeFileSync(seedHashFile, bundledHash, "utf-8");
    }
  } else if (runtimeMissingOrEmpty) {
    fs.writeFileSync(
      runtimeDataFile,
      JSON.stringify(
        {
          students: [],
          teachers: [],
          questions: [],
          quizzes: [],
          reports: [],
          vocabularychapters: [],
        },
        null,
        2,
      ),
      "utf-8",
    );
  }

  return runtimeDir;
}

function startBackend() {
  const backendPath = getBackendPath();
  const runtimeDataDir = prepareRuntimeDataDirectory();
  logMain(`Backend path: ${backendPath}`);
  logMain(`Runtime data dir: ${runtimeDataDir}`);
  process.env.APP_DATA_DIR = runtimeDataDir;
  const backend = require(backendPath);
  return backend.startBackendServer().then((server) => {
    backendServer = server;
    logMain("Backend server started");
    return server;
  });
}

async function waitForBackend(timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch("http://127.0.0.1:5000/health");
      if (response.ok) return true;
    } catch (_err) {
      // ignore while polling
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return false;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    win.loadURL("http://localhost:8080");
  }
}

app.whenReady().then(async () => {
  try {
    await startBackend();
  } catch (error) {
    console.error("Backend failed to start:", error);
    logMain(`Backend start error: ${error && error.stack ? error.stack : String(error)}`);
  }
  await waitForBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (backendServer) backendServer.close();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (backendServer) backendServer.close();
});