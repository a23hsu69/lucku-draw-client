const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "dist"))); // serve React build

let fixedWinner = null;      // set by admin
let firstWinnerGiven = false; // track if first winner is already used

// Admin sets the fixed first winner
app.post("/set-winner", (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.status(400).json({ success: false, message: "Number required" });
  }

  if (fixedWinner) {
    return res.json({ success: false, number: fixedWinner });
  }

  fixedWinner = number;
  return res.json({ success: true, number: fixedWinner });
});

// User fetches winner
app.get("/get-winner", (req, res) => {
  if (fixedWinner && !firstWinnerGiven) {
    firstWinnerGiven = true; // first winner is consumed
    return res.json({ success: true, number: fixedWinner });
  }

  // After first winner → random numbers
  const randomNumber = Math.floor(Math.random() * (2500 - 2000 + 1)) + 2000;
  return res.json({ success: true, number: randomNumber });
});

// Fallback for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
