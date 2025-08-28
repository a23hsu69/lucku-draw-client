import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

// Setup __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "dist"))); // React build
app.use(express.static(path.join(__dirname))); // for admin.html & assets

// Global first winner
let firstWinner = null;

// Serve admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// API to set first winner
app.post("/set-winner", (req, res) => {
  if (!firstWinner) {
    const { number } = req.body;
    if (!number || isNaN(number)) {
      return res.status(400).json({ success: false, message: "Invalid number" });
    }
    firstWinner = String(number).padStart(4, "0");
    return res.json({ success: true, number: firstWinner });
  } else {
    return res.json({ success: false, number: firstWinner });
  }
});

// API to get first winner
app.get("/get-winner", (req, res) => {
  res.json({ number: firstWinner });
});

// Fallback for React SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
