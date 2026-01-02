const mongoose = require("mongoose");
const { Schema } = mongoose;


const progressSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  subjectId: mongoose.Schema.Types.ObjectId,
  chapterId: mongoose.Schema.Types.ObjectId,
  completed: Boolean
});

mongoose.model("progress", progressSchema);