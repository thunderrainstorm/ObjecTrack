const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect("mongodb+srv://msambita04:$Tanya06@cluster0.dhvdcfb.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Schema definition
const detectionSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  objects: Map,
});

const Detection = mongoose.model("Detection", detectionSchema);

// Route for the root URL
app.get("/", (req, res) => {
  res.send("Welcome to the Home Page");
});

// API endpoint to store detections
app.post("/api/detections", async (req, res) => {
  try {
    const { objects } = req.body;

    // Check if 'objects' is an array
    if (!Array.isArray(objects)) {
      throw new Error("Objects must be an array");
    }

    const timestamp = new Date();

    // Aggregate detections
    const objectCounts = objects.reduce((acc, obj) => {
      acc[obj.class] = (acc[obj.class] || 0) + 1;
      return acc;
    }, {});

    const newDetection = new Detection({ timestamp, objects: objectCounts });
    await newDetection.save();
    console.log("Detection saved:", newDetection);

    res.status(201).json({ message: "Detection saved successfully" });
  } catch (error) {
    console.error("Error saving detection:", error);
    res.status(400).json({ message: error.message || "Error saving detection" });
  }
});

// API endpoint to retrieve detections
app.get("/api/detections", async (req, res) => {
  try {
    const detections = await Detection.find().exec();
    res.status(200).json(detections);
  } catch (error) {
    console.error("Error fetching detections:", error);
    res.status(500).json({ message: "Error fetching detections" });
  }
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: "Resource not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

