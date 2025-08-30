import express from "express";
import path from "path";

const app = express();
app.use(express.json());

// Serve React build
app.use(express.static(path.join(process.cwd(), "dist"))); // Vite default build folder

// API endpoints
let firstWinner = null;
app.get("/get-winner", (req, res) => res.json({ number: firstWinner }));
app.post("/set-winner", (req, res) => {
  if (firstWinner !== null) return res.json({ success: false, number: firstWinner });
  firstWinner = req.body.number.toString().padStart(4, "0");
  res.json({ success: true });
});

// Serve admin panel
app.get("/admin", (req, res) => res.sendFile(path.join(process.cwd(), "admin.html")));

// Serve React for all other routes
app.get("*", (req, res) => res.sendFile(path.join(process.cwd(), "dist", "index.html")));

app.listen(process.env.PORT || 5000, () => console.log("Server started"));
