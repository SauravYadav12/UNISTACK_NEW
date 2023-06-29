const mongoose = require("mongoose");

const logsSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  loginTime: {
    type: Date,
    required: true,
  },
});

const Logs = mongoose.model("Logs", logsSchema);

module.exports = Logs;
