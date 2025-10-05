import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const SCRIPT_URL = process.env.API_SECRET; // Your Apps Script Web App URL

// ---------------- PROXY ROUTES ----------------

// POST: create/update/delete team
app.post("/api", async (req, res) => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: fetch teams
app.get("/api", async (req, res) => {
  try {
    const query = new URLSearchParams(req.query).toString();
    const response = await fetch(`${SCRIPT_URL}?${query}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => console.log(`✅ Proxy server running on port ${PORT}`));
