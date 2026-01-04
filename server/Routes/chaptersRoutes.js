const mongoose = require("mongoose");
const Chapters = mongoose.model("chapters");
const Progress = mongoose.model("progress");
const Payment = mongoose.model("payments");

module.exports = (app) => {
  // Add New Chapter
  app.post("/api/v1/chapters/add", async (req, res) => {
    const { subjectId, name, description, videourl, chapterNumber } = req.body;

    try {
      const chapters = await Chapters.findOne({ name, subjectId });
      if (chapters) {
        return res.status(400).json({ message: "Chapter already exists" });
      }
      chapterFields = { subjectId, name, description, videourl, chapterNumber };

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

  // Get Chapters by SubjectId with Child Progress
  app.get("/api/v1/chapters/subject/:subjectId/:childId", async (req, res) => {
    const { subjectId, childId } = req.params;

    try {
      // Get all chapters for this subject, sorted by chapter number
      const chapters = await Chapters.find({ subjectId: subjectId }).sort({ chapterNumber: 1 });

      if (!chapters || chapters.length === 0) {
        return res.status(404).json({ message: "No chapters found for this subject." });
      }

      // Get child's progress for this subject
      const childProgress = await Progress.find({ 
        childId: childId, 
        subjectId: subjectId 
      });

      // Check if payment has been made for this subject
      const hasPayment = await Payment.findOne({
        childId: childId,
        subjectId: subjectId,
        status: 'success'
      });

      // Enhance chapters with progress and lock status
      const enhancedChapters = chapters.map((chapter, index) => {
        const chapterProgress = childProgress.find(
          p => p.chapterId.toString() === chapter._id.toString()
        );

        // Determine if chapter is locked
        let isLocked = false;
        let status = "Locked";
        let progress = 0;
        let lockReason = null;

        if (chapter.chapterNumber === 1) {
          // First chapter is always unlocked (free chapter)
          isLocked = false;
          if (chapterProgress?.progressPercentage >= 100) {
            status = "Completed";
            progress = 100;
          } else if (chapterProgress?.progressPercentage > 0) {
            status = "In Progress";
            progress = chapterProgress.progressPercentage;
          } else {
            status = "Not Started";
            progress = 0;
          }
        } else {
          // For chapters beyond the first one, payment is required
          if (!hasPayment) {
            isLocked = true;
            status = "Locked";
            progress = 0;
            lockReason = "Payment required to unlock this chapter";
          } else {
            // Payment is done, now check if previous chapter is completed
            const previousChapter = chapters[index - 1];
            const previousProgress = childProgress.find(
              p => p.chapterId.toString() === previousChapter._id.toString()
            );

            if (previousProgress?.completed) {
              // Previous chapter completed, unlock this one
              isLocked = false;
              if (chapterProgress?.progressPercentage >= 100) {
                status = "Completed";
                progress = 100;
              } else if (chapterProgress?.progressPercentage > 0) {
                status = "In Progress";
                progress = chapterProgress.progressPercentage;
              } else {
                status = "Not Started";
                progress = 0;
              }
            } else {
              // Previous chapter not completed, lock this one
              isLocked = true;
              status = "Locked";
              progress = 0;
              lockReason = "Complete previous chapter to unlock";
            }
          }
        }

        return {
          ...chapter.toObject(),
          locked: isLocked,
          status: status,
          progress: progress,
          hasProgress: !!chapterProgress,
          lockReason: lockReason,
          isPaid: !!hasPayment
        };
      });

      res.status(200).json({ 
        message: "Chapters fetched successfully", 
        chapters: enhancedChapters,
        paymentStatus: !!hasPayment
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update Chapter Progress
  app.post("/api/v1/chapters/progress/update", async (req, res) => {
    const { chapterId, subjectId, childId, progressPercentage, completed } = req.body;

    if (!childId) {
      return res.status(400).json({ message: "childId is required" });
    }

    try {
      // Find existing progress or create new one
      let progress = await Progress.findOne({
        childId: childId,
        chapterId: chapterId,
        subjectId: subjectId,
      });

      if (progress) {
        // Update existing progress
        progress.progressPercentage = progressPercentage;
        progress.completed = completed || progressPercentage >= 100;
        await progress.save();
      } else {
        // Create new progress entry
        progress = await Progress.create({
          childId: childId,
          chapterId: chapterId,
          subjectId: subjectId,
          progressPercentage: progressPercentage,
          completed: completed || progressPercentage >= 100,
        });
      }

      res.status(200).json({ 
        message: "Progress updated successfully", 
        progress: progress 
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Mark Chapter as Complete
  app.post("/api/v1/chapters/complete", async (req, res) => {
    const { chapterId, subjectId, childId } = req.body;

    if (!childId) {
      return res.status(400).json({ message: "childId is required" });
    }

    try {
      let progress = await Progress.findOne({
        childId: childId,
        chapterId: chapterId,
        subjectId: subjectId,
      });

      if (progress) {
        progress.completed = true;
        progress.progressPercentage = 100;
        await progress.save();
      } else {
        progress = await Progress.create({
          childId: childId,
          chapterId: chapterId,
          subjectId: subjectId,
          completed: true,
          progressPercentage: 100,
        });
      }

      res.status(200).json({ 
        message: "Chapter marked as complete", 
        progress: progress 
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });
};