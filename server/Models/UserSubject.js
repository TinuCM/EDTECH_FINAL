const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSubjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'children',
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'subjects',
    required: true
  },
  locked: {
    type: Boolean,
    default: true 
  },
  purchaseDate: {
    type: Date
  },
  transactionId: {
    type: String
  },

  amount: {
    type: Number
  }
}, {
  timestamps: true
});


userSubjectSchema.index({ userId: 1, subjectId: 1 }, { unique: true });

mongoose.model("usersubjects", userSubjectSchema);

