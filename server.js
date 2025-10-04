import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import jwt from "jsonwebtoken";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const SCRIPT_URL = process.env.API_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

// ---------------- LOGIN ROUTE ----------------
app.post("/api/login", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email required" });
    }

    // In a real app, you’d check DB — here we just trust Google login
    const token = jwt.sign({ name, email }, JWT_SECRET, { expiresIn: "2h" });

    return res.json({
      success: true,
      token,
      user: { name, email },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- VERIFY TOKEN ----------------
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ success: false, message: "Missing token" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ success: false, message: "Invalid token" });
    req.user = user;
    next();
  });
}

// ---------------- PROXY ROUTES ----------------
app.post("/api", verifyToken, async (req, res) => {
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

app.listen(PORT, () => console.log(`✅ Proxy server running on port ${PORT}`));
