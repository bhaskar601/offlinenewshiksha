const express = require("express");
const cors = require("cors");
const { ensureDataFile } = require("./lib/dataStore");

const questionRoutes = require("./routes/question");
const quizRoutes = require("./routes/quiz");
const studentRoutes = require("./routes/student");
const teacherRoutes = require("./routes/teacher");
const reportRoutes = require("./routes/report");
const schoolRoutes = require("./routes/school");
const vocabRoutes = require("./routes/vocabularyRoutes");

const app = express();
const PORT = 5000;
let server = null;

app.use(cors());
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

function startBackendServer(port = PORT) {
  if (server) return Promise.resolve(server);
  ensureDataFile();
  return new Promise((resolve, reject) => {
    const nextServer = app.listen(port);
    const onError = (error) => {
      nextServer.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      nextServer.off("error", onError);
      server = nextServer;
      console.log(`Offline backend running at http://localhost:${port}`);
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