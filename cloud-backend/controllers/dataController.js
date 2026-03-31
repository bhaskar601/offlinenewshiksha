const Quiz = require("../models/Quiz");
const Attempt = require("../models/Attempt");

function normalizeQuiz(doc) {
  return {
    id: doc.uniqueId,
    quizId: doc.quizId || doc.payload?.quizId || null,
    teacherId: doc.teacherId || doc.payload?.teacherId || null,
    questions: Array.isArray(doc.questions) ? doc.questions : doc.payload?.questions || [],
    synced: !!doc.synced,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

exports.getAllQuizzes = async (_req, res) => {
  const quizzes = await Quiz.find({}).sort({ createdAt: -1 }).lean();
  res.json(quizzes.map(normalizeQuiz));
};

exports.getQuizByQuizId = async (req, res) => {
  const { quizId } = req.params;
  const quiz = await Quiz.findOne({
    $or: [{ quizId }, { "payload.quizId": quizId }],
  }).lean();

  if (!quiz) {
    return res.status(404).json({ error: "Quiz not found" });
  }

  res.json(normalizeQuiz(quiz));
};

exports.getReportsByQuizId = async (req, res) => {
  const { quizId } = req.params;
  const attempts = await Attempt.find({
    $or: [{ quizId }, { "payload.quizId": quizId }],
  })
    .sort({ createdAt: -1 })
    .lean();

  const reports = attempts.map((a) => ({
    id: a.uniqueId,
    quizId: a.quizId || a.payload?.quizId || null,
    studentId: a.studentId || a.payload?.studentId || null,
    answers: Array.isArray(a.answers) ? a.answers : a.payload?.answers || [],
    attemptedAt: a.attemptedAt || a.payload?.attemptedAt || a.createdAt,
    raw: a.payload || {},
  }));

  res.json({
    quizId,
    totalReports: reports.length,
    reports,
  });
};

