import express from "express";
import path from "path";

const app = express();
app.use(express.json());

let firstWinner = null;

// Serve React build
app.use(express.static(path.join(process.cwd(), "build")));

// Get first winner
app.get("/get-winner", (req, res) => {
  res.json({ number: firstWinner });
});

// Set first winner
app.post("/set-winner", (req, res) => {
  if (firstWinner !== null) {
    return res.json({ success: false, number: firstWinner });
  }
  const { number } = req.body;
  firstWinner = number.toString().padStart(4, "0");
  res.json({ success: true });
});

// Serve admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(process.cwd(), "admin.html"));
});

// Serve React for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "build", "index.html"));
});

app.listen(5000, () => console.log("Server running on port 5000"));
