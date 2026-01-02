const mongoose = require("mongoose");
const { Schema } = mongoose;


const leaderboardSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  classnumber: Number,
  totalScore: Number
});
mongoose.model("leaderboards", leaderboardSchema);