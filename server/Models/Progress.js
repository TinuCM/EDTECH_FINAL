const mongoose = require("mongoose");
const { Schema } = mongoose;


const progressSchema = new mongoose.Schema({
  childId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'children',
    required: true 
  },
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subjects',
    required: true 
  },
  chapterId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chapters',
    required: true 
  },
  completed: { type: Boolean, default: false },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
}, { timestamps: true });

// Create unique index to ensure one progress record per child per chapter
progressSchema.index({ childId: 1, chapterId: 1 }, { unique: true });

mongoose.model("progress", progressSchema);