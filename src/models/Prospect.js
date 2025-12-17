const mongoose = require("mongoose");

const prospectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  loanAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  smsStatus: { type: String, default: "pending" },
  scheduledAt: { type: Date, required: true }
});

module.exports = mongoose.model("Prospect", prospectSchema);