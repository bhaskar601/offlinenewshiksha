const express = require("express");
const router = express.Router();
const { readJSON, writeJSON, safeArray, makeId } = require("../lib/dataStore");

// ✅ Create new chapter (with passage & questions)
router.post("/", async (req, res) => {
  try {
    const { chapter, passage, questions } = req.body;
    const db = readJSON();
    const newChapter = { _id: makeId("voc"), chapter, passage, questions: safeArray(questions) };
    db.vocabularychapters.push(newChapter);
    writeJSON(db);
    res.status(201).json({
      message: "Chapter created successfully",
      data: newChapter,
    });
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Get all chapters (title + passage)
router.get("/", async (req, res) => {
  try {
    const db = readJSON();
    const chapters = safeArray(db.vocabularychapters).map((x) => ({
      _id: x._id,
      chapter: x.chapter,
      passage: x.passage,
    }));
    res.status(200).json(chapters);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Error fetching chapters", error });
  }
});

// ✅ Get one chapter (with passage + all questions)
router.get("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const chapter = safeArray(db.vocabularychapters).find((x) => String(x._id) === String(req.params.id));
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    res.status(200).json(chapter);
  } catch (error) {
    console.error("Fetch Chapter Error:", error);
    res.status(500).json({ message: "Error fetching chapter", error });
  }
});

// ✅ Evaluate user answers
router.post("/evaluate", async (req, res) => {
  try {
    const { chapterId, answers } = req.body;

    const db = readJSON();
    const chapter = safeArray(db.vocabularychapters).find((x) => String(x._id) === String(chapterId));
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    let totalCorrect = 0,
      totalIncorrect = 0,
      totalUnattempted = 0;

    const details = chapter.questions.map((q) => {
      const ans = answers.find((a) => a.questionId === q._id.toString());

      if (!ans) {
        totalUnattempted++;
        return {
          questionId: q._id,
          question: q.question,
          selectedAnswer: null,
          correctAnswer: q.correctAnswer,
          isCorrect: false,
        };
      }

      const isCorrect = ans.selectedAnswer === q.correctAnswer;
      if (isCorrect) totalCorrect++;
      else totalIncorrect++;

      return {
        questionId: q._id,
        question: q.question,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });

    res.status(200).json({
      message: "Evaluation complete",
      result: {
        totalCorrect,
        totalIncorrect,
        totalUnattempted,
      },
      details,
    });
  } catch (error) {
    console.error("Evaluate Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
