const mongoose = require("mongoose");
const { Schema } = mongoose;


const chapterSchema = new mongoose.Schema({
  subjectId: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String,
  videourl: String,
  chapterNumber: { type: Number, required: true },
});


mongoose.model("chapters", chapterSchema);