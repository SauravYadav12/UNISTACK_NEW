const mongoose = require("mongoose");

const interviewTeams = new mongoose.Schema(
  {
    teamId: {
      type: String,
    },
    teamName: {
      type: Date,
      required: true,
    },
    primaryPerson: {
      type: String,
    },
    secondaryPerson: {
      type: String,
    },
    primaryPhone: {
      type: String,
    },
    secondaryPhone: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Logs = mongoose.model("Logs", interviewTeams);

module.exports = Logs;
