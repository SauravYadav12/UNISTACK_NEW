const express = require("express");
const router = express.Router();
const Teams = require("../controllers/interviewTeams");
const { ensureAuthenticated } = require("../config/auth");

router.get(
  "/interview-teams",
  ensureAuthenticated,
  Teams.getInterviewTeamsDashboard
);

module.exports = router;
