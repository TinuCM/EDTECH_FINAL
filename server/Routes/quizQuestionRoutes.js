const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const QuizQuestion = mongoose.model("quizquestions");
const Subject = mongoose.model("subjects");
const Chapter = mongoose.model("chapters");

module.exports = (app) => {
  // Add Quiz Question to Chapter
  app.post("/api/v1/quiz/question/add", async (req, res) => {
    const { chapterId, question, options, correctAnswer, marks } = req.body;

    try {
      // Validate required fields
      if (!chapterId || !question || !options || !correctAnswer) {
        return res.status(400).json({ 
          message: "Chapter ID, question, options, and correct answer are required" 
        });
      }

      // Validate options array
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ 
          message: "At least 2 options are required" 
        });
      }

      // Verify chapter exists
      const chapter = await Chapter.findById(chapterId);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }

      // Create quiz question
      const quizQuestion = await QuizQuestion.create({
        chapterId,
        question,
        options,
        correctAnswer,
        marks: marks || 1
      });

      res.status(201).json({ 
        message: "Quiz question added successfully",
        question: quizQuestion
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get All Questions for a Chapter
  app.get("/api/v1/quiz/questions/chapter/:chapterId", async (req, res) => {
    const { chapterId } = req.params;

    try {
      const questions = await QuizQuestion.find({ chapterId })
        .select('-correctAnswer'); // Don't send correct answer to frontend

      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

      res.status(200).json({ 
        message: "Questions retrieved successfully",
        questions,
        totalQuestions: questions.length,
        totalMarks
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });

  // // Get All Questions for a Chapter (Admin view with answers)
  // app.get("/api/v1/quiz/questions/chapter/:chapterId/admin", async (req, res) => {
  //   const { chapterId } = req.params;

  //   try {
  //     const questions = await QuizQuestion.find({ chapterId });

  //     const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  //     res.status(200).json({ 
  //       message: "Questions retrieved successfully",
  //       questions,
  //       totalQuestions: questions.length,
  //       totalMarks
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({ message: error.message });
  //   }
  // });

  // Get Single Question by ID 
  app.get("/api/v1/quiz/question/:questionId", async (req, res) => {
    const { questionId } = req.params;

    try {
      const question = await QuizQuestion.findById(questionId);

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.status(200).json({ 
        message: "Question retrieved successfully",
        question
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });
 
};

