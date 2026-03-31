const Student = require("../models/Student");
const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");

async function upsertMany(Model, records = [], mapRecord = () => ({})) {
  for (const rec of records) {
    if (!rec || !rec.uniqueId) continue;
    const mapped = mapRecord(rec);
    await Model.updateOne(
      { uniqueId: rec.uniqueId },
      {
        $set: {
          uniqueId: rec.uniqueId,
          synced: true,
          createdAt: rec.createdAt ? new Date(rec.createdAt) : new Date(),
          ...mapped,
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

  await upsertMany(Student, students, (rec) => ({
    studentId: rec.studentId || rec.payload?.studentId || null,
    name: rec.name || rec.payload?.name || null,
  }));

  await upsertMany(Quiz, quizzes, (rec) => ({
    quizId: rec.quizId || rec.payload?.quizId || null,
    teacherId: rec.teacherId || rec.payload?.teacherId || null,
    questions: Array.isArray(rec.questions) ? rec.questions : rec.payload?.questions || [],
  }));

  await upsertMany(Attempt, attempts, (rec) => ({
    quizId: rec.quizId || rec.payload?.quizId || null,
    studentId: rec.studentId || rec.payload?.studentId || null,
    answers: Array.isArray(rec.answers) ? rec.answers : rec.payload?.answers || [],
    attemptedAt: rec.attemptedAt ? new Date(rec.attemptedAt) : new Date(),
  }));

  res.json({ ok: true });
};

