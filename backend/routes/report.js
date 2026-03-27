const express = require("express");
const { readJSON, writeJSON, safeArray, makeId } = require("../lib/dataStore");

const router = express.Router();

// Generate student + question report on quiz submission
router.post("/submit-report", async (req, res) => {
  const { quizId, studentId, answers } = req.body;

  try {
    const db = readJSON();
    const quiz = safeArray(db.quizzes).find((x) => String(x.quizId) === String(quizId));
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    const quizQuestions = safeArray(quiz.questions)
      .map((id) => safeArray(db.questions).find((q) => String(q._id) === String(id)))
      .filter(Boolean);

    let correct = 0,
      incorrect = 0,
      unattempted = 0;

    const studentAnswers = quizQuestions.map((q) => {
        const answerObj = answers.find((a) => a.questionId === q._id.toString());
        if (!answerObj) {
          unattempted++;
          updateQuizReport(db, quizId, q._id, "unattempted");
          return {
            questionId: q._id,
            selectedAnswer: null,
            isCorrect: false,
          };
        }

        const isCorrect = answerObj.selectedAnswer === q.correctAnswer;
        if (isCorrect) correct++;
        else incorrect++;

        updateQuizReport(db, quizId, q._id, isCorrect ? "correct" : "incorrect");

        return {
          questionId: q._id,
          selectedAnswer: answerObj.selectedAnswer,
          isCorrect,
        };
      });

    const studentReport = {
      _id: makeId("srep"),
      quizId,
      studentId,
      correct,
      incorrect,
      unattempted,
      answers: studentAnswers,
    };
    db.reports = safeArray(db.reports).filter(
      (r) => !(String(r.quizId) === String(quizId) && String(r.studentId) === String(studentId)),
    );
    db.reports.push(studentReport);
    writeJSON(db);
    res.status(201).json({ message: "Report generated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Utility to update QuizReport stats
function updateQuizReport(db, quizId, questionId, status) {
  const quiz = safeArray(db.quizzes).find((x) => String(x.quizId) === String(quizId));
  if (!quiz) return;
  quiz.questionStats = safeArray(quiz.questionStats);
  const questionStat = quiz.questionStats.find((stat) => String(stat.questionId) === String(questionId));

  if (questionStat) {
    if (status === "correct") questionStat.correctCount++;
    if (status === "incorrect") questionStat.incorrectCount++;
    if (status === "unattempted") questionStat.unattemptedCount++;
  } else {
    quiz.questionStats.push({
      questionId,
      correctCount: status === "correct" ? 1 : 0,
      incorrectCount: status === "incorrect" ? 1 : 0,
      unattemptedCount: status === "unattempted" ? 1 : 0,
    });
  }
}

// GET student performance
router.get("/student/:studentId", async (req, res) => {
  const { studentId } = req.params;
  try {
    const db = readJSON();
    const reports = safeArray(db.reports).filter((x) => String(x.studentId) === String(studentId));
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Error fetching student report" });
  }
});

// GET questionwise report for quiz
router.get("/quiz/:quizId", async (req, res) => {
   const { quizId } = req.params; 
  try {
    const db = readJSON();
    const quiz = safeArray(db.quizzes).find((x) => String(x.quizId) === String(quizId));
    const questionStats = safeArray(quiz?.questionStats);
    if (!quiz || questionStats.length === 0) return res.status(404).json({ error: "No report for this quiz" });
    res.json({ quizId, questionStats });
  } catch (err) {
    res.status(500).json({ error: "Error fetching quiz report" });
  }
});

// GET all student reports for a specific quiz
router.get("/student-quiz/:quizId", async (req, res) => {
  const { quizId } = req.params;

  try {
    const db = readJSON();
    const reports = safeArray(db.reports).filter((x) => String(x.quizId) === String(quizId));
    res.json(reports);
  } catch (err) {
    console.error("Error fetching student quiz reports:", err);
    res.status(500).json({ error: "Error fetching reports" });
  }
});


module.exports = router;
