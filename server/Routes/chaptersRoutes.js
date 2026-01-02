const mongoose = require("mongoose");
const Chapters = mongoose.model("chapters");

module.exports = (app) => {
  // Add New Chapter
  app.post("/api/v1/chapters/add", async (req, res) => {
    const { subjectId,name, description,videourl } = req.body;

    try {
      const chapters= await Chapters.findOne({ name });
      if (chapters) {
        return res.status(400).json({ message: "Chapter already exists" });
      }
      chapterFields = { subjectId,name, description,videourl };

      const response = await Chapters.create(chapterFields);

      res.status(201).json({ message: "Chapter added successfully", response });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get All Subjects
    app.get("/api/v1/chapters/all/get", async (req, res) => {
    try {
      const chapters = await Chapters.find();

      if (!chapters) {
        return res.status(400).json({ message: "There are no chapters." });
      }

      res.status(201).json({ message: "Chapters: ", chapters });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });
};