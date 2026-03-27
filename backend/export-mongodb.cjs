const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const DEFAULT_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DEFAULT_DB = process.env.MONGO_DB_NAME || "test";
const OUTPUT_FILE = path.join(__dirname, "data.json");
const RAW_OUTPUT_FILE = path.join(__dirname, "mongo-export.raw.json");

function toArrayMap(docs) {
  return docs.map((doc) => {
    const plain = JSON.parse(JSON.stringify(doc));
    return plain;
  });
}

function normalizeForOfflineApp(rawCollections) {
  return {
    students: rawCollections.students || [],
    teachers: rawCollections.teachers || [],
    questions: rawCollections.questions || [],
    quizzes: rawCollections.quizzes || [],
    reports: rawCollections.reports || rawCollections.quizreports || [],
    vocabularychapters: rawCollections.vocabularychapters || [],
  };
}

async function run() {
  const client = new MongoClient(DEFAULT_URI);
  await client.connect();
  const db = client.db(DEFAULT_DB);

  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  const exportPayload = {};

  for (const col of collections) {
    const name = col.name;
    const docs = await db.collection(name).find({}).toArray();
    exportPayload[name] = toArrayMap(docs);
  }

  const normalized = normalizeForOfflineApp(exportPayload);

  fs.writeFileSync(RAW_OUTPUT_FILE, JSON.stringify(exportPayload, null, 2), "utf-8");
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(normalized, null, 2), "utf-8");

  await client.close();
  console.log(`Mongo export complete -> ${OUTPUT_FILE}`);
}

run().catch((err) => {
  console.error("Failed to export MongoDB data:", err.message);
  process.exit(1);
});
