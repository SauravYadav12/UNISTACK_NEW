const express = require("express");
const passport = require("passport");
const requirementController = require("../controllers/reqController");
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

////////////////////GET METHODS -  REQUIREMENT CREATION ///////////////////////
  router.get('/requirements/createReq',ensureAuthenticated,requirementController.getCreateReqPage);
  router.get('/all-records',ensureAuthenticated,requirementController.getSearchReq); // ADD THIS AS 2ND OPTION "ensureAuthenticated"
  router.get('/home', ensureAuthenticated, requirementController.getHomePage);
  router.get('/requirements/reqlist/:page', ensureAuthenticated, requirementController.getReqList);
  router.get("/exportData/:page",ensureAuthenticated,requirementController.exportData );


  router.get('/requirements/viewReq/:reqID',ensureAuthenticated,requirementController.getViewRecordPage);
  router.get('/requirements/updateReq/:reqID',ensureAuthenticated,requirementController.getUpdateReqPage);
  router.get('/requirements/deleteReq/:reqID',ensureAuthenticated,requirementController.getDeletePage);
// ===================================================================================

//////////////////POST REQUEST ///////////////////
  router.post('/postCreateReq',ensureAuthenticated,requirementController.postCreatePage);
  router.post('/postUpdateReq',ensureAuthenticated,requirementController.postUpdateRecordPage);
  router.post('/postDeletePage',ensureAuthenticated,requirementController.postDeletePage);
  router.post('/copy-record',ensureAuthenticated,requirementController.getCreateReqPage);

  router.get("/reports-dashboard",ensureAuthenticated,requirementController.getDashboard1)
  router.get('/weeklydata',ensureAuthenticated,requirementController.getWeeklydataForchart);


module.exports = router;
