const express = require("express");
const router = express.Router();
const { readJSON, writeJSON, safeArray, makeId } = require("../lib/dataStore");

// Create a new school
router.post("/", async (req, res) => {
  try {
    const db = readJSON();
    const school = { _id: makeId("sch"), ...req.body };
    db.schools.push(school);
    writeJSON(db);
    res.status(201).json(school);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all schools
router.get("/", async (req, res) => {
  try {
    const db = readJSON();
    const schools = safeArray(db.schools);
    res.status(200).json(schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get school by ID
router.get("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const school = safeArray(db.schools).find((x) => String(x._id) === String(req.params.id));
    if (!school) return res.status(404).json({ message: "School not found" });
    res.status(200).json(school);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update school by ID
router.put("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const index = safeArray(db.schools).findIndex((x) => String(x._id) === String(req.params.id));
    if (index === -1) return res.status(404).json({ message: "School not found" });
    const updated = { ...db.schools[index], ...req.body };
    db.schools[index] = updated;
    writeJSON(db);
    if (!updated) return res.status(404).json({ message: "School not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete school by ID
router.delete("/:id", async (req, res) => {
  try {
    const db = readJSON();
    const before = safeArray(db.schools).length;
    db.schools = safeArray(db.schools).filter((x) => String(x._id) !== String(req.params.id));
    const deleted = before !== db.schools.length;
    writeJSON(db);
    if (!deleted) return res.status(404).json({ message: "School not found" });
    res.status(200).json({ message: "School deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
