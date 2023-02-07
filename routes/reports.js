const express = require("express");
const passport = require("passport");
const reports = require("../controllers/reports");
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

router.get('/support',ensureAuthenticated ,reports.getSupportDashboard );
router.get('/marketing',ensureAuthenticated,reports.getMarketingDashboard );
router.get('/query',ensureAuthenticated,reports.getSupportDetailsByQuery);
router.post('/getSupportReport',ensureAuthenticated,reports.getSupportHistoricalReports);
router.post('/getMarketingReport',ensureAuthenticated,reports.getMarketingHistoricalReport);


module.exports = router