const mongoose = require("mongoose");

const knowledgeSchema = new mongoose.Schema({
  question: String,
  answer: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Knowledge", knowledgeSchema);