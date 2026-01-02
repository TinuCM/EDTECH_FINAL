const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  email: String,
  otp:String
  
});

    
mongoose.model("edtechusers", userSchema);
