const express = require("express");
const router = express.Router();
const { readJSON, writeJSON, safeArray, makeId } = require("../lib/dataStore");

// Create a new teacher
router.post("/", async (req, res) => {
  try {
    const db = readJSON();
    const { teacherId } = req.body || {};
    if (!teacherId) return res.status(400).json({ error: "teacherId is required" });
    if (safeArray(db.teachers).some((x) => String(x.teacherId) === String(teacherId))) {
      return res.status(409).json({ error: "Teacher already exists" });
    }
    const teacher = {
      _id: makeId("tch"),
      ...req.body,
      quizzesCreated: safeArray(req.body?.quizzesCreated),
      questionAdded: safeArray(req.body?.questionAdded),
    };
    db.teachers.push(teacher);
    writeJSON(db);
    res.status(201).json(teacher);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.post("/addquestion", async (req, res) => {
  const { teacherId, questionData } = req.body;

  try {
    const db = readJSON();
    const teacher = safeArray(db.teachers).find((x) => String(x.teacherId) === String(teacherId));
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Push questionData directly to the embedded array
    teacher.questionAdded.push(questionData);
    writeJSON(db);

    res
      .status(201)
      .json({
        message: "Question added to teacher successfully",
        question: questionData,
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { teacherId, password } = req.body;

  if (!teacherId || !password) {
    return res
      .status(400)
      .json({ error: "Teacher ID and password are required." });
  }

  try {
    const db = readJSON();
    const teacher = safeArray(db.teachers).find((x) => String(x.teacherId) === String(teacherId));

    if (!teacher) {
      return res.status(401).json({ error: "Invalid Teacher ID or password." });
    }

    // Plaintext password check for now (replace with hashed password check in production)
    if (teacher.password !== password) {
      return res.status(401).json({ error: "Invalid Teacher ID or password." });
    }

    res.status(200).json({
      message: "Login successful",
      teacher: {
        _id: teacher._id,
        teacherId: teacher.teacherId,
        name: teacher.name,
        // include any other fields you want
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// Get all teachers
router.get("/", async (req, res) => {
  try {
    const db = readJSON();
    const teachers = safeArray(db.teachers);
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get teacher by ID (with quizzesCreated populated)
router.get("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const teacher = safeArray(db.teachers).find((x) => String(x.teacherId) === String(req.params.id));
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update teacher by ID
router.put("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const index = safeArray(db.teachers).findIndex((x) => String(x.teacherId) === String(req.params.id));
    if (index === -1) return res.status(404).json({ message: "Teacher not found" });
    const updated = { ...db.teachers[index], ...req.body };
    db.teachers[index] = updated;
    writeJSON(db);
    if (!updated) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete teacher by ID
router.delete("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const before = safeArray(db.teachers).length;
    db.teachers = safeArray(db.teachers).filter((x) => String(x.teacherId) !== String(req.params.id));
    const deleted = before !== db.teachers.length;
    writeJSON(db);
    if (!deleted) return res.status(404).json({ message: "Teacher not found" });
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:teacherId/create-quiz", async (req, res) => {
  try {
    const db = readJSON();
    const teacher = safeArray(db.teachers).find((x) => String(x.teacherId) === String(req.params.teacherId));
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const quizData = {
      ...req.body,
      teacherId: req.params.teacherId,
    };

    const quiz = {
      _id: makeId("quiz"),
      ...quizData,
      questions: safeArray(quizData?.questions),
      attemptedBy: [],
    };
    db.quizzes.push(quiz);

    teacher.quizzesCreated = safeArray(teacher.quizzesCreated);
    teacher.quizzesCreated.push(quiz._id);
    writeJSON(db);

    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /teachers/:teacherId/quizzes
router.get("/:teacherId/quizzes", async (req, res) => {
  try {
    const db = readJSON();
    const teacher = safeArray(db.teachers).find((x) => String(x.teacherId) === String(req.params.teacherId));

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const quizIds = safeArray(teacher.quizzesCreated).map((id) => String(id));
    const quizzes = safeArray(db.quizzes).filter((q) => quizIds.includes(String(q._id)));
    res.status(200).json(quizzes);
  } catch (err) {
    console.error("Error fetching teacher quizzes:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});





module.exports = router;
