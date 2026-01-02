const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Child = mongoose.model("children");
const UserSubject = mongoose.model("usersubjects");
const Subjects = mongoose.model("subjects");
const Payment = mongoose.model("payments");

module.exports = (app) => {
  app.post("/api/v1/payment/unlock-subject", requireLogin, async (req, res) => {
    const { childId, subjectId, transactionId, amount } = req.body;
    const parentId = req.user.id; // Get parent ID from logged-in user

    try {
      // Validate required fields
      if (!childId || !subjectId) {
        return res.status(400).json({ 
          message: "Child ID and Subject ID are required" 
        });
      }

      // Verify the child belongs to this parent
      const child = await Child.findOne({ _id: childId, parentId });
      if (!child) {
        return res.status(404).json({ 
          message: "Child not found or you don't have permission to unlock subjects for this child" 
        });
      }

      // Verify the subject exists
      const subject = await Subjects.findById(subjectId);
      if (!subject) {
        return res.status(404).json({ 
          message: "Subject not found" 
        });
      }

      // Find the UserSubject entry
      const userSubject = await UserSubject.findOne({ 
        userId: childId, 
        subjectId: subjectId 
      });

      if (!userSubject) {
        return res.status(404).json({ 
          message: "Subject is not assigned to this child" 
        });
      }

      // Check if already unlocked
      if (!userSubject.locked) {
        return res.status(400).json({ 
          message: "This subject is already unlocked for this child",
          subject: {
            name: subject.name,
            unlockedDate: userSubject.purchaseDate
          }
        });
      }

      // Unlock the subject
      userSubject.locked = false;
      userSubject.purchaseDate = new Date();
      userSubject.transactionId = transactionId || `TEMP_${Date.now()}`; // Temporary ID if not provided
      userSubject.amount = amount || subject.price;
      
      await userSubject.save();

      // Create payment record
      const paymentRecord = await Payment.create({
        parentId: parentId,
        childId: childId,
        subjectId: subjectId,
        amount: userSubject.amount,
        transactionId: userSubject.transactionId,
        paymentDate: userSubject.purchaseDate,
        status: 'success'
      });


      res.status(200).json({ 
        message: "Subject unlocked successfully!",
        data: {
          child: {
            _id: child._id,
            name: child.name,
            classno: child.classno
          },
          subject: {
            _id: subject._id,
            name: subject.name,
            price: subject.price
          },
          purchaseDetails: {
            purchaseDate: userSubject.purchaseDate,
            transactionId: userSubject.transactionId,
            amount: userSubject.amount,
            locked: userSubject.locked
          },
          paymentRecordId: paymentRecord._id
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });


};

