const express = require("express");
const passport = require("passport");
const reports = require("../controllers/reports");
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

router.get('/support',ensureAuthenticated ,reports.getSupportDashboard );
router.get('/marketing',ensureAuthenticated,reports.getMarketingDashboard );


module.exports = router