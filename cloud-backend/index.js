const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const syncRoutes = require("./routes/syncRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", syncRoutes);

async function start() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("Missing MONGO_URI in environment");
  }

  await mongoose.connect(uri);
  console.log("Mongo connected");

  const port = Number(process.env.PORT) || 5000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`cloud-backend listening on 0.0.0.0:${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start cloud-backend:", err);
  process.exit(1);
});

