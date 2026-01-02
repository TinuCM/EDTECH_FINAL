const express = require("express"); // npm i express
const mongoose = require("mongoose"); // npm i mongoose
require("dotenv").config(); // Load environment variables. Make sure .env is in .gitignore

const port = process.env.PORT || 5001;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

// Models
// require("./models/Movie");
require("./Models/User");
require("./Models/Child");
require("./Models/Subject");
require("./Models/Chapter");
require("./Models/Progress");
require("./Models/QuizScore");
require("./Models/QuizQuestions");
require("./Models/Leaderboard");
require("./Models/UserSubject");
require("./Models/Payment");


// Routes

require("./Routes/authRoutes")(app); // Authentication Routes
require("./Routes/childRoutes")(app); // Child/Student Management Routes
require("./Routes/paymentRoutes")(app); // Payment/Unlock Routes
require("./Routes/chaptersRoutes")(app); // Chapters Routes
require("./Routes/subjectRoutes")(app); // Subject Routes
require("./Routes/quizQuestionRoutes")(app); // Quiz Questions Routes
require("./Routes/quizScoreRoutes")(app); // Quiz Scores Routes

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});