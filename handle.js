const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/tutorManagementSystem",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const studentSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  contact: { type: String, required: true },
});

const tutorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  subject: { type: String, required: true },
  contact: { type: String, required: true },
  salary: { type: Number, required: true },
  gender: { type: String, required: true },
  rating: { type: Map, of: String, default: {} },
});

const adminSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const contactSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  message: { type: String, required: true },
});

const Student = mongoose.model("Student", studentSchema);
const Tutor = mongoose.model("Tutor", tutorSchema);
const Admin = mongoose.model("Admin", adminSchema);
const Contact = mongoose.model("Contact", contactSchema);

const adminVerify = async (req, res, next) => {
  try {
    const session = req.params.session;
    const admin = await Admin.findOne({ _id: session });

    if (admin) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized. Admin session not valid." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred during admin verification." });
  }
};

const studentVerify = async (req, res, next) => {
  try {
    const session = req.params.session;
    const student = await Student.findOne({ _id: session });

    if (student) {
      next();
    } else {
      res
        .status(401)
        .json({ error: "Unauthorized. Student session not valid." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred during student verification." });
  }
};

const tutorVerify = async (req, res, next) => {
  try {
    const session = req.params.session;
    const tutor = await Tutor.findById(session);

    if (tutor) {
      next();
    } else {
      res
        .status(401)
        .json({ error: "Unauthorized. Tutor session not valid." + session });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred during tutor verification." });
  }
};

app.get("/api/student/profile/:session", studentVerify, async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.session });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

app.get("/api/tutor/profile/:session", tutorVerify, async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.session);
    res.status(200).json(tutor);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

app.get("/api/users/count/:session", adminVerify, async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const tutorCount = await Tutor.countDocuments();
    const totalCount = studentCount + tutorCount;

    res.status(200).json({
      studentCount,
      tutorCount,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching user counts:", error.message);
    res.status(500).json({ error: "Failed to fetch user counts." });
  }
});

app.get("/api/tutor/search/", async (req, res) => {
  try {
    let data = await Tutor.find();
    res.status(200).json({
      data,
    });
  } catch (error) {
    console.error("Error fetching tutor data:", error.message);
    res.status(500).json({ error: "Failed to fetch tutor data." });
  }
});

app.post("/api/tutor/rate", async (req, res) => {
  try {
    // Validate request body
    const { tutorId, session } = req.body;
    if (!tutorId && !session) {
      return res
        .status(400)
        .json({ error: "Tutor ID and Session is required." });
    }

    // Find the tutor by ID
    let tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found." });
    }

    // Increment the tutor's rating
    tutor.rating.set(session.toString(), true);

    // Save the updated tutor document
    await tutor.save();

    // Respond with the updated tutor data
    res.status(200).json({
      message: "Tutor rating updated successfully.",
      data: tutor,
    });
  } catch (error) {
    console.error("Error updating tutor rating:", error.message);
    res.status(500).json({ error: "Failed to update tutor rating." });
  }
});

app.get("/api/contact/:session", adminVerify, async (req, res) => {
  try {
    const contact = await Contact.find();
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch message." });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const { email, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ error: "All fields are required!" });
    }
    const newContact = new Contact({
      email,
      message,
    });
    await newContact.save();

    res.status(201).json({ message: "Contact Submitted Successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch message." });
  }
});

app.post("/registration/student", async (req, res) => {
  const { first_name, last_name, email, password, contact } = req.body;

  if (!first_name || !last_name || !email || !password || !contact) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: "Email already registered!" });
    }

    const newStudent = new Student({
      first_name,
      last_name,
      email,
      password,
      contact,
    });

    await newStudent.save();
    res.status(201).json({ message: "Student registered successfully!" });
  } catch (error) {
    console.error("Error during student registration:", error.message);
    res.status(500).json({ error: "Failed to register student." });
  }
});

app.post("/registration/tutor", async (req, res) => {
  const {
    name,
    email,
    password,
    department,
    subject,
    contact,
    salary,
    gender,
  } = req.body;
  if (
    !name ||
    !email ||
    !password ||
    !department ||
    !subject ||
    !contact ||
    !salary ||
    !gender
  ) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const existingTutor = await Tutor.findOne({ email });
    if (existingTutor) {
      return res.status(400).json({ error: "Email already registered!" });
    }

    const newTutor = new Tutor({
      name,
      email,
      password,
      department,
      subject,
      contact,
      salary,
      gender,
    });

    await newTutor.save();
    res.status(201).json({ message: "Tutor registered successfully!" });
  } catch (error) {
    console.error("Error during tutor registration:", error.message);
    res.status(500).json({ error: "Failed to register tutor." });
  }
});

app.post("/login/admin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email, password });
    if (!admin) {
      return res.status(404).json({ message: "Admin Login Failed." });
    }

    res.status(200).json({ message: admin._id.toString() });
  } catch (error) {
    console.error("Error during tutor login:", error.message);
    res.status(500).json({ error: "An error occurred during login." });
  }
});

app.post("/login/tutor", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingTutor = await Tutor.findOne({ email, password });
    if (!existingTutor) {
      return res.status(404).json({ message: "Tutor not found." });
    }

    res.status(200).json({ message: existingTutor._id });
  } catch (error) {
    console.error("Error during tutor login:", error.message);
    res.status(500).json({ error: "An error occurred during login." });
  }
});

app.post("/login/student", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingStudent = await Student.findOne({ email, password });
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.status(200).json({ message: existingStudent._id });
  } catch (error) {
    console.error("Error during student login:", error.message);
    res.status(500).json({ error: "An error occurred during login." });
  }
});

app.get("/api/users/:session", adminVerify, async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

app.get("/api/tutors/:session", adminVerify, async (req, res) => {
  try {
    const tutors = await Tutor.find();
    res.status(200).json(tutors);
  } catch (error) {
    console.error("Error fetching tutors:", error.message);
    res.status(500).json({ error: "Failed to fetch tutors." });
  }
});

app.put("/api/managetutors/:id/:session", adminVerify, async (req, res) => {
  const tutorId = req.params.id;
  const { name, email, department, subject, contact, salary, gender } =
    req.body;

  if (
    !name ||
    !email ||
    !department ||
    !subject ||
    !contact ||
    !salary ||
    !gender
  ) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const updatedTutor = await Tutor.findByIdAndUpdate(
      tutorId,
      {
        name,
        email,
        department,
        subject,
        contact,
        salary,
        gender,
      },
      { new: true }
    );

    if (!updatedTutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }

    res
      .status(200)
      .json({ message: "Tutor updated successfully", updatedTutor });
  } catch (error) {
    console.error("Error updating tutor:", error.message);
    res.status(500).json({ error: "Failed to update tutor." });
  }
});

// Route to delete a tutor by ID
app.delete("/api/deletetutors/:id/:session", adminVerify, async (req, res) => {
  const tutorId = req.params.id;

  try {
    const deletedTutor = await Tutor.findByIdAndDelete(tutorId);

    if (!deletedTutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }

    res.status(200).json({ message: "Tutor deleted successfully" });
  } catch (error) {
    console.error("Error deleting tutor:", error.message);
    res.status(500).json({ error: "Failed to delete tutor." });
  }
});

//route to update a student by id
app.put("/api/managestudents/:id/:session", adminVerify, async (req, res) => {
  const studentId = req.params.id;
  const { first_name, last_name, email, contact } = req.body;

  if (!first_name || !last_name || !email || !contact) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { first_name, last_name, email, contact },
      { new: true } // Return the updated student
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res
      .status(200)
      .json({ message: "Student updated successfully", updatedStudent });
  } catch (error) {
    console.error("Error updating student:", error.message);
    res.status(500).json({ error: "Failed to update student." });
  }
});

app.delete(
  "/api/managestudents/:session/:id/:session",
  adminVerify,
  async (req, res) => {
    const studentId = req.params.id;

    try {
      const deletedStudent = await Student.findByIdAndDelete(studentId);

      if (!deletedStudent) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("Error deleting student:", error.message);
      res.status(500).json({ error: "Failed to delete student." });
    }
  }
);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
