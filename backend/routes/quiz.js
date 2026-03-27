const express = require("express");
const router = express.Router();
const { readJSON, writeJSON, safeArray, makeId } = require("../lib/dataStore");

function populateQuizQuestions(db, quiz) {
  const questions = safeArray(quiz.questions)
    .map((id) => safeArray(db.questions).find((q) => String(q._id) === String(id)))
    .filter(Boolean);
  return { ...quiz, questions };
}


// Create a new quiz
router.post("/", async (req, res) => {
  try {
    const db = readJSON();
    const { teacherId, quizId } = req.body;

    const teacher = safeArray(db.teachers).find((x) => String(x.teacherId) === String(teacherId));
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    if (!quizId) return res.status(400).json({ error: "quizId is required" });
    if (safeArray(db.quizzes).some((x) => String(x.quizId) === String(quizId))) {
      return res.status(409).json({ error: "Quiz already exists" });
    }

    const quiz = {
      _id: makeId("quiz"),
      ...req.body,
      questions: safeArray(req.body?.questions),
      attemptedBy: safeArray(req.body?.attemptedBy),
    };
    db.quizzes.push(quiz);

    teacher.quizzesCreated = safeArray(teacher.quizzesCreated);
    teacher.quizzesCreated.push(quiz._id);
    writeJSON(db);

    res.status(201).json(quiz);
  } catch (err) {
    console.error("Error creating quiz:", err);
    res.status(400).json({ error: err.message });
  }
});

// Get all quizzes
router.get("/", async (req, res) => {
  try {
    const db = readJSON();
    const quizzes = safeArray(db.quizzes).map((quiz) => populateQuizQuestions(db, quiz));
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quiz by ID
router.get("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const quiz = safeArray(db.quizzes).find((x) => String(x.quizId) === String(req.params.id));
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(populateQuizQuestions(db, quiz));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update quiz by ID
router.put("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const index = safeArray(db.quizzes).findIndex((x) => String(x._id) === String(req.params.id));
    if (index === -1) return res.status(404).json({ message: "Quiz not found" });
    const updated = { ...db.quizzes[index], ...req.body };
    if (req.body?.questions) updated.questions = safeArray(req.body.questions);
    db.quizzes[index] = updated;
    writeJSON(db);
    if (!updated) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete quiz by ID
router.delete("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const before = safeArray(db.quizzes).length;
    db.quizzes = safeArray(db.quizzes).filter((x) => String(x._id) !== String(req.params.id));
    const deleted = before !== db.quizzes.length;
    writeJSON(db);
    if (!deleted) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quizzes created by a specific teacher
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const db = readJSON();
    const quizzes = safeArray(db.quizzes)
      .filter((x) => String(x.teacherId) === String(req.params.teacherId))
      .map((quiz) => populateQuizQuestions(db, quiz));
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get quizzes attempted by a specific student
router.get("/student/:studentId", async (req, res) => {
  try {
    const db = readJSON();
    const quizzes = safeArray(db.quizzes)
      .filter((x) => safeArray(x.attemptedBy).includes(req.params.studentId))
      .map((quiz) => populateQuizQuestions(db, quiz));
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:quizId/custom-question", async (req, res) => {
  try {
    const { quizId } = req.params;
    const { question, questionImage, options, correctAnswer, teacherId } = req.body;

    if (!question || !options || !correctAnswer || !teacherId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = readJSON();
    const newQuestion = {
      _id: makeId("q"),
      question,
      questionImage,
      options,
      correctAnswer,
      teacherId,
      class: "custom",
      subject: "custom",
      topic: "custom",
      isCustom: true,
    };
    db.questions.push(newQuestion);

    const quiz = safeArray(db.quizzes).find((x) => String(x.quizId) === String(quizId));
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    quiz.questions = safeArray(quiz.questions);
    quiz.questions.push(newQuestion._id);
    writeJSON(db);

    res.status(201).json({ message: "Custom question added", question: newQuestion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
