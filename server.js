import express from "express";
import path from "path";

const app = express();
app.use(express.json());

let firstWinner = null;

// Serve React build
app.use(express.static(path.join(process.cwd(), "dist")));

// API endpoints
app.get("/get-winner", (req, res) => res.json({ number: firstWinner }));

app.post("/set-winner", (req, res) => {
  firstWinner = req.body.number.toString().padStart(4, "0");
  res.json({ success: true, number: firstWinner });
});

// Reset first winner
app.post("/reset-winner", (req, res) => {
  firstWinner = null;
  res.json({ success: true });
});

// Serve Admin panel
app.get("/admin", (req, res) => res.sendFile(path.join(process.cwd(), "admin.html")));

// Serve React app for all other routes
app.get("*", (req, res) => res.sendFile(path.join(process.cwd(), "dist", "index.html")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
