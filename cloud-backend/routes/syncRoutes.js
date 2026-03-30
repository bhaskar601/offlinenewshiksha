const express = require("express");
const { sync } = require("../controllers/syncController");

const router = express.Router();

router.post("/sync", sync);

module.exports = router;

