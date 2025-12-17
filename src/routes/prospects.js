const express = require("express");
const router = express.Router();
const Prospect = require("../models/Prospect");

// Add a new prospect
router.post("/", async (req, res) => {
  try {
    const { name, phone, loanAmount } = req.body;

    // Calculate scheduled SMS time (24 hours later)
    let scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // If scheduledAt is Sunday, move to Monday 8AM
    if (scheduledAt.getDay() === 0) {
      scheduledAt.setDate(scheduledAt.getDate() + 1); // Monday
      scheduledAt.setHours(8, 0, 0, 0); // 8:00 AM
    }

    const prospect = new Prospect({ name, phone, loanAmount, scheduledAt });
    await prospect.save();

    res.status(201).json({ message: "Prospect saved", prospect });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;