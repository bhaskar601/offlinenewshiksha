const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

let backendProcess = null;

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
  const bundledDataFile = getBundledDataPath();

  if (!fs.existsSync(runtimeDir)) {
    fs.mkdirSync(runtimeDir, { recursive: true });
  }

  if (!fs.existsSync(runtimeDataFile) || fs.readFileSync(runtimeDataFile, "utf-8").trim() === "") {
    if (fs.existsSync(bundledDataFile)) {
      fs.copyFileSync(bundledDataFile, runtimeDataFile);
    } else {
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
  }

  return runtimeDir;
}

function startBackend() {
  const backendPath = getBackendPath();
  const runtimeDataDir = prepareRuntimeDataDirectory();
  backendProcess = spawn(process.execPath, [backendPath], {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      APP_DATA_DIR: runtimeDataDir,
    },
  });

  backendProcess.on("error", (err) => {
    console.error("Backend error:", err);
  });

  backendProcess.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error("Backend exited with code:", code);
    }
  });
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

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (backendProcess) backendProcess.kill();
});