const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Subjects = mongoose.model("subjects");
const UserSubject = mongoose.model("usersubjects");
const Child = mongoose.model("children");

module.exports = (app) => {
  // Add New Subject
  app.post("/api/v1/subject/add", async (req, res) => {
    const { classnumber, name, price } = req.body;

    try {
      const subject = await Subjects.findOne({ name, classnumber });
      if (subject) {
        return res.status(400).json({ message: "Subject already exists for this class" });
      }

      subjectFields = { 
        classnumber, 
        name, 
        price: price || 0
      };

      const response = await Subjects.create(subjectFields);

      // Get all children (students) in this class
      const children = await Child.find({ classno: classnumber, isActive: true });
      console.log(`Found ${children.length} children in class ${classnumber}`);

      // Create locked UserSubject entries for all children in this class
      const userSubjects = children.map(child => ({
        userId: child._id, // Using child's ID as userId in UserSubject
        subjectId: response._id,
        locked: true // Locked by default
      }));

      if (userSubjects.length > 0) {
        const insertedUserSubjects = await UserSubject.insertMany(userSubjects);
        console.log(`Created ${insertedUserSubjects.length} locked UserSubject entries`);
      } else {
        console.log(`Warning: No children found in class ${classnumber}. No UserSubject entries created.`);
      }

      res.status(201).json({ 
        message: "Subject added successfully", 
        response,
        childrenInitialized: userSubjects.length
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get All Subjects (Public)
  app.get("/api/v1/subject/all/get", async (req, res) => {
    try {
      const subjects = await Subjects.find();

      if (!subjects) {
        return res.status(400).json({ message: "There are no subjects." });
      }

      res.status(200).json({ message: "Subjects: ", subjects });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get Subjects for a specific child (Parent views child's subjects)
  app.get("/api/v1/subject/child/:childId", requireLogin, async (req, res) => {
    const parentId = req.user.id;
    const { childId } = req.params;

    try {
      // Verify the child belongs to this parent
      const child = await Child.findOne({ _id: childId, parentId });

      if (!child) {
        return res.status(404).json({ 
          message: "Child not found or you don't have permission to view this child's subjects" 
        });
      }

      // Get all subjects for child's class
      const subjects = await Subjects.find({ classnumber: child.classno });
      
      if (!subjects || subjects.length === 0) {
        return res.status(404).json({ 
          message: "No subjects found for this child's class",
          classno: child.classno 
        });
      }

      // Get all UserSubject entries for this child
      const userSubjects = await UserSubject.find({ userId: childId });
      const userSubjectMap = {};
      userSubjects.forEach(us => {
        userSubjectMap[us.subjectId.toString()] = us;
      });

      // Map subjects with lock status
      const subjectsWithStatus = subjects.map(subject => {
        const userSubject = userSubjectMap[subject._id.toString()];

        // If no UserSubject entry exists, create one automatically
        if (!userSubject) {
          // Create the entry in background (don't wait)
          UserSubject.create({
            userId: childId,
            subjectId: subject._id,
            locked: true
          }).catch(err => console.log("Error creating UserSubject:", err));
        }

        return {
          _id: subject._id,
          name: subject.name,
          classnumber: subject.classnumber,
          price: subject.price,
          locked: userSubject ? userSubject.locked : true,
          purchaseDate: userSubject && !userSubject.locked ? userSubject.purchaseDate : null,
          transactionId: userSubject && !userSubject.locked ? userSubject.transactionId : null
        };
      });

      res.status(200).json({ 
        message: "Subjects retrieved successfully",
        child: {
          _id: child._id,
          name: child.name,
          classno: child.classno
        },
        subjects: subjectsWithStatus,
        totalSubjects: subjectsWithStatus.length
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });
};