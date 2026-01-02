const mongoose = require("mongoose");
const User = mongoose.model("edtechusers");
const jwt = require("jsonwebtoken"); // npm i jsonwebtoken
const sendEmail = require("../utils/sendEmail");

const requireLogin = require("../middleware/requireLogin");

const otpLength = 6;

module.exports = (app) => {


    app.post("/api/v1/parent/login", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      //   Generate the OTP
      const digits = "0123456789";
      let newOTP = "";
      for (let i = 0; i < otpLength; i++) {
        newOTP += digits[Math.floor(Math.random() * digits.length)];
      }
      console.log("newOTP: ", newOTP);

      //   Check if user already exists
      let user = await User.findOne({ email });

      //   If user exists, update OTP
      if (user) {
        await User.updateOne({ email }, {$set:{ otp: newOTP }});
        await sendEmail({
          to: email,
          subject: "Parent Login OTP",
          text: `Your OTP to login as a parent is ${newOTP}.`,
        });
        res.status(200).json({ 
          message: "OTP Sent Successfully",
          isNewUser: false 
        });
      } 
      else {
        // Create new parent user with OTP
        const newUser = await User.create({
          email,
          otp: newOTP,
          role: "parent" // Mark as parent user
        });
        
        await sendEmail({
          to: email,
          subject: "Welcome to Study.Pilot - Your OTP",
          text: `Welcome to Study.Pilot! Your OTP to complete registration is ${newOTP}.`,
        });
        
        res.status(200).json({ 
          message: "Account created! OTP Sent Successfully",
          isNewUser: true 
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  });
    app.post("/api/v1/verify/parent", async (req, res) => {
    try {
      const { email, otp } = req.body;

      const user = await User.findOne({ email });

      if (user && user.otp === otp) {
        const payload = {
          id: user._id,
          email: user.email,
          role: user.role || "parent",
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });

        res.status(200).json({ 
          message: "Parent Login Success", 
          token,
          user: {
            id: user._id,
            email: user.email,
            role: "parent"
          }
        });
      } else if (!user) {
        res.status(400).json({ message: "User not found" });
      } else {
        res.status(400).json({ message: "Invalid OTP" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  });


};