const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    uniqueId: { type: String, required: true, index: true, unique: true },
    synced: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Quiz", QuizSchema);

