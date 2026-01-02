const mongoose = require("mongoose");
const { Schema } = mongoose;


const subjectSchema = new mongoose.Schema({
  classnumber: Number,
  name: String,
  price:Number,
});


mongoose.model("subjects", subjectSchema);