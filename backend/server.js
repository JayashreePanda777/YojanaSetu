const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Load JSON database
const schemes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "schemes.json"), "utf8")
);

// ========================
// Health Check
// ========================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Government Scheme Eligibility API Running 🚀"
  });
});

// ========================
// Get all states
// ========================
app.get("/states", (req, res) => {
  res.json({
    success: true,
    states: Object.keys(schemes)
  });
});

// ========================
// Get schemes by state
// ========================
app.get("/schemes/:state", (req, res) => {
  const state = req.params.state;

  if (!schemes[state]) {
    return res.status(404).json({
      success: false,
      message: "State not found"
    });
  }

  res.json({
    success: true,
    state,
    count: schemes[state].length,
    data: schemes[state]
  });
});

// ========================
// Search schemes
// ========================
app.get("/search", (req, res) => {
  const query = req.query.q?.toLowerCase();

  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Query parameter 'q' is required"
    });
  }

  let results = [];

  for (let state in schemes) {
    schemes[state].forEach((scheme) => {
      if (scheme.name.toLowerCase().includes(query)) {
        results.push({
          ...scheme,
          state
        });
      }
    });
  }

  res.json({
    success: true,
    total: results.length,
    results
  });
});

// ========================
// Eligibility Engine
// ========================
function isEligible(scheme, user) {
  const { income, gender, farmer, bpl } = user;

  if (scheme.eligibility.farmer && !farmer) return false;

  if (scheme.eligibility.bpl && !bpl) return false;

  if (
    scheme.eligibility.female &&
    gender?.toLowerCase() !== "female"
  )
    return false;

  if (
    scheme.eligibility.incomeBelow &&
    income > scheme.eligibility.incomeBelow
  )
    return false;

  return true;
}

// ========================
// Eligibility Check API
// ========================
app.post("/api/check", (req, res) => {
  const user = req.body;
  const { state } = user;

  let eligible = [];

  // Central schemes
  schemes.central.forEach((scheme) => {
    if (isEligible(scheme, user)) {
      eligible.push({
        ...scheme,
        type: "central"
      });
    }
  });

  // State schemes
  if (schemes[state]) {
    schemes[state].forEach((scheme) => {
      if (isEligible(scheme, user)) {
        eligible.push({
          ...scheme,
          type: "state",
          state
        });
      }
    });
  }

  res.json({
    success: true,
    total: eligible.length,
    schemes: eligible
  });
});

// ========================
// Start Server
// ========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});