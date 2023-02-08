const express = require("express");
const passport = require("passport");
const reports = require("../controllers/reports");
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

router.get('/support',ensureAuthenticated ,reports.getSupportDashboard );
router.get('/marketing',ensureAuthenticated,reports.getMarketingDashboard );
router.get('/interview-report',ensureAuthenticated,reports.getInterviewStatus );
router.get('/squery',ensureAuthenticated,reports.getSupportDetailsByQuery);
router.get('/mquery',ensureAuthenticated,reports.getMarketingDetailsByQuery);
router.get('/iquery',ensureAuthenticated,reports.getInterviewDetailsByQuery);

router.post('/getSupportReport',ensureAuthenticated,reports.getSupportHistoricalReports);
router.post('/getMarketingReport',ensureAuthenticated,reports.getMarketingHistoricalReport);
router.post('/getInterviewReport',ensureAuthenticated,reports.getInterviewHistoricReport);



module.exports = router