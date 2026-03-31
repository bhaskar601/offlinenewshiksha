const express = require("express");
const { sync } = require("../controllers/syncController");
const {
  getAllQuizzes,
  getQuizByQuizId,
  getReportsByQuizId,
} = require("../controllers/dataController");

const router = express.Router();

router.post("/sync", sync);
router.get("/quizzes", getAllQuizzes);
router.get("/quizzes/:quizId", getQuizByQuizId);
router.get("/reports/quiz/:quizId", getReportsByQuizId);

module.exports = router;

