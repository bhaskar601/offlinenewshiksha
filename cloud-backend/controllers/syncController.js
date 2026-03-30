const Student = require("../models/Student");
const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");

async function upsertMany(Model, records = []) {
  for (const rec of records) {
    if (!rec || !rec.uniqueId) continue;
    // Store original record under payload so we don't need to mirror local schema.
    await Model.updateOne(
      { uniqueId: rec.uniqueId },
      {
        $set: {
          uniqueId: rec.uniqueId,
          synced: true,
          createdAt: rec.createdAt ? new Date(rec.createdAt) : new Date(),
          payload: rec,
        },
      },
      { upsert: true },
    );
  }
}

exports.sync = async (req, res) => {
  const { deviceId, data } = req.body || {};

  const students = Array.isArray(data?.students) ? data.students : [];
  const quizzes = Array.isArray(data?.quizzes) ? data.quizzes : [];
  const attempts = Array.isArray(data?.attempts) ? data.attempts : [];

  console.log("[sync] deviceId:", deviceId);
  console.log("[sync] received:", {
    students: students.length,
    quizzes: quizzes.length,
    attempts: attempts.length,
  });

  await upsertMany(Student, students);
  await upsertMany(Quiz, quizzes);
  await upsertMany(Attempt, attempts);

  res.json({ ok: true });
};

