// After Middleware
const prospectRoutes = require("./src/routes/prospects");
app.use("/api/prospects", prospectRoutes);const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
const AfricasTalking = require("africastalking");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const AT_USERNAME = process.env.AT_USERNAME;
const AT_API_KEY = process.env.AT_API_KEY;

const africastalking = AfricasTalking({
  username: AT_USERNAME,
  apiKey: AT_API_KEY
});
const sms = africastalking.SMS;

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error", err));

const prospectSchema = new mongoose.Schema({
  name: String,
  phone: String,
  loanAmount: Number,
  createdAt: { type: Date, default: Date.now },
  smsSent: { type: Boolean, default: false }
});

const Prospect = mongoose.model("Prospect", prospectSchema);

app.get("/", (req, res) => {
  res.send("Demulla backend running");
});

app.post("/prospects", async (req, res) => {
  const { name, phone, loanAmount } = req.body;
  const prospect = new Prospect({ name, phone, loanAmount });
  await prospect.save();
  res.json({ message: "Prospect saved" });
});

cron.schedule("0 * * * *", async () => {
  const now = new Date();
  const day = now.getDay();

  if (day === 0) return;

  const prospects = await Prospect.find({ smsSent: false });

  for (let p of prospects) {
    const hoursPassed = (now - p.createdAt) / (1000 * 60 * 60);

    if (day === 1 && now.getHours() === 8) {
      await sendSMS(p);
      continue;
    }

    if (hoursPassed >= 24 && hoursPassed <= 26) {
      await sendSMS(p);
    }
  }
});

async function sendSMS(p) {
  const message = `Hi ${p.name}, you qualify for a loan of KES ${p.loanAmount}. Visit Demulla Credit to proceed.`;

  try {
    await sms.send({
      to: [p.phone],
      message,
      from: "DEMULLA"
    });
    p.smsSent = true;
    await p.save();
  } catch (err) {
    console.error("SMS error", err);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});