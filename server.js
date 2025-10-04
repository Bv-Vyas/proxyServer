import express from "express";
import fetch from "node-fetch"; // ES module import
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT;

app.use(cors()); // allow all origins
app.use(express.json());

const SCRIPT_URL = process.env.API_SECRET;

// POST endpoint to forward data to Google Apps Script
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

// GET endpoint to fetch data from Google Apps Script
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

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
