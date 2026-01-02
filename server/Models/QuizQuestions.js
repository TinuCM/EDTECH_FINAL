const mongoose = require("mongoose");
const { Schema } = mongoose;

// Quiz questions for each chapter
const quizQuestionSchema = new mongoose.Schema({
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chapters',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  marks: {
    type: Number,
    default: 1
  }
});

mongoose.model("quizquestions", quizQuestionSchema);