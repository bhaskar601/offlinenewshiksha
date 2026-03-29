const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { ensureDataFile } = require("./lib/dataStore");

const questionRoutes = require("./routes/question");
const quizRoutes = require("./routes/quiz");
const studentRoutes = require("./routes/student");
const teacherRoutes = require("./routes/teacher");
const reportRoutes = require("./routes/report");
const schoolRoutes = require("./routes/school");
const vocabRoutes = require("./routes/vocabularyRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.BIND_HOST || "0.0.0.0";
let server = null;

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/questions", questionRoutes);
app.use("/quizzes", quizRoutes);
app.use("/students", studentRoutes);
app.use("/teachers", teacherRoutes);
app.use("/reports", reportRoutes);
app.use("/schools", schoolRoutes);
app.use("/vocab", vocabRoutes);

const distPath = path.join(__dirname, "..", "dist");
const distIndex = path.join(distPath, "index.html");
if (fs.existsSync(distIndex)) {
  app.use(express.static(distPath));
  // Express 5 / path-to-regexp v8: bare "*" is invalid; use a final middleware for SPA fallback.
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(distIndex);
  });
}

function logListenAddresses(port) {
  console.log(`HTTP server bound on ${HOST}:${port} (LAN clients: use this machine's IP)`);
  const urls = [`http://127.0.0.1:${port}`, `http://localhost:${port}`];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const v4 = net.family === "IPv4" || net.family === 4;
      if (v4 && !net.internal) {
        urls.push(`http://${net.address}:${port}`);
      }
    }
  }
  console.log("Reachable URLs (share LAN address with browser clients):");
  for (const u of urls) console.log(`  ${u}`);
  console.log(
    "Persistence: all API writes use the JSON store on this computer only. MongoDB is not used by live API routes.",
  );
}

function startBackendServer(port = PORT) {
  if (server) return Promise.resolve(server);
  ensureDataFile();
  return new Promise((resolve, reject) => {
    const nextServer = app.listen(port, HOST);
    const onError = (error) => {
      nextServer.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      nextServer.off("error", onError);
      server = nextServer;
      logListenAddresses(port);
      resolve(server);
    };
    nextServer.once("error", onError);
    nextServer.once("listening", onListening);
  });
}

function stopBackendServer() {
  if (!server) return;
  server.close();
  server = null;
}

if (require.main === module) {
  startBackendServer().catch((error) => {
    console.error("Failed to start backend server:", error);
    process.exit(1);
  });
}

module.exports = {
  app,
  startBackendServer,
  stopBackendServer,
};
