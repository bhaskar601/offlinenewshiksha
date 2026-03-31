const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema(
  {
    uniqueId: { type: String, required: true, index: true, unique: true },
    quizId: { type: String, index: true },
    studentId: { type: String, index: true },
    answers: { type: [mongoose.Schema.Types.Mixed], default: [] },
    attemptedAt: { type: Date, default: Date.now },
    synced: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Attempt", AttemptSchema);

