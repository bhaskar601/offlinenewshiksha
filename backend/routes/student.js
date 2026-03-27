const express = require("express");
const router = express.Router();
const { readJSON, writeJSON, safeArray, makeId } = require("../lib/dataStore");

// Create a new student
router.post("/", async (req, res) => {
  try {
    const db = readJSON();
    const { studentId } = req.body || {};
    if (!studentId) return res.status(400).json({ error: "studentId is required" });
    if (safeArray(db.students).some((x) => String(x.studentId) === String(studentId))) {
      return res.status(409).json({ error: "Student already exists" });
    }
    const student = {
      _id: makeId("stu"),
      studentId,
      name: req.body?.name || "",
      phone: req.body?.phone || "",
      password: req.body?.password || "",
      schoolId: req.body?.schoolId || "",
      class: req.body?.class || "",
      quizAttempted: [],
    };
    db.students.push(student);
    writeJSON(db);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // Check for missing fields
    if (!studentId || !password) {
      return res
        .status(400)
        .json({ error: "Student ID and password are required" });
    }

    // Find student by studentId
    const db = readJSON();
    const student = safeArray(db.students).find((x) => String(x.studentId) === String(studentId));

    // If not found or password doesn't match
    if (!student || student.password !== password) {
      return res.status(401).json({ error: "Invalid student ID or password" });
    }

    // Login successful
    res.status(200).json({
      message: "Login successful",
      student
    });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Get all students
router.get("/", async (req, res) => {
  try {
    const db = readJSON();
    const students = safeArray(db.students);
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student by ID
router.get("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const student = safeArray(db.students).find((x) => String(x.studentId) === String(req.params.id));
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student by ID
router.put("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const index = safeArray(db.students).findIndex((x) => String(x.studentId) === String(req.params.id));
    if (index === -1) return res.status(404).json({ message: "Student not found" });
    const updated = { ...db.students[index], ...req.body };
    db.students[index] = updated;
    writeJSON(db);
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete student by ID
router.delete("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const before = safeArray(db.students).length;
    db.students = safeArray(db.students).filter((x) => String(x.studentId) !== String(req.params.id));
    const deleted = before !== db.students.length;
    writeJSON(db);
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/attempt-quiz", async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const db = readJSON();

    const student = safeArray(db.students).find((x) => String(x.studentId) === String(req.params.id));
    if (!student) return res.status(404).json({ message: "Student not found" });

    const quiz = safeArray(db.quizzes).find((x) => String(x.quizId) === String(quizId));
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let correct = 0, incorrect = 0;
    const evaluatedAnswers = [];
    const quizQuestionIds = safeArray(quiz.questions).map((q) => String(q));
    const answerMap = new Map(safeArray(answers).map((a) => [String(a.questionId), a.selectedAnswer]));

    for (const questionId of quizQuestionIds) {
      const question = safeArray(db.questions).find((q) => String(q._id) === String(questionId));
      if (!question) continue;
      const selectedAnswer = answerMap.get(String(questionId));

      if (!selectedAnswer || String(selectedAnswer).trim() === "") {
        evaluatedAnswers.push({
          _id: makeId("ans"),
          questionId: String(question._id),
          selectedAnswer: "",
          isCorrect: false
        });
      } else {
        const isCorrect = String(selectedAnswer) === String(question.correctAnswer);
        if (isCorrect) correct++;
        else incorrect++;

        evaluatedAnswers.push({
          _id: makeId("ans"),
          questionId: String(question._id),
          selectedAnswer: String(selectedAnswer),
          isCorrect
        });
      }
    }

    const unattempted = Math.max(quizQuestionIds.length - evaluatedAnswers.length, 0);
    const score = { correct, incorrect, unattempted };

    student.quizAttempted = safeArray(student.quizAttempted);
    const index = student.quizAttempted.findIndex(q => q.quizId === quizId);
    if (index !== -1) {
      student.quizAttempted[index].answers = evaluatedAnswers;
      student.quizAttempted[index].score = score;
      student.quizAttempted[index].attemptedAt = new Date().toISOString();
    } else {
      student.quizAttempted.push({
        quizId,
        answers: evaluatedAnswers,
        score,
        attemptedAt: new Date().toISOString(),
      });
    }

    quiz.attemptedBy = safeArray(quiz.attemptedBy);
    if (!quiz.attemptedBy.includes(student.studentId)) {
      quiz.attemptedBy.push(student.studentId);
    }

    writeJSON(db);
    res.status(200).json({ message: "Quiz evaluated and saved", student });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
