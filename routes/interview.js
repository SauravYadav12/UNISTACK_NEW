const express = require("express");
const passport = require("passport");
const interviewController = require("../controllers/interviewController");
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

//////////////////////////INTERVIEW MODULES - Get Request///////////////////////////////////////////

  router.get('/interviews/dashboard/:page',ensureAuthenticated,interviewController.getDashboardPage);
  router.get('/interviews/view-interviews/:intId',ensureAuthenticated,interviewController.getInterviewViewPage);
  router.get('/interviews/get-interview-details',ensureAuthenticated,interviewController.getInterviewDetailsPage);
  router.get('/interviews/update-interview/:intId',ensureAuthenticated,interviewController.getInterviewUpdatePage);
  router.get('/interviews/delete-interview/:intId',ensureAuthenticated,interviewController.getInterviewDeletePage);
////////////////////////////////////POST Request/////////////////////////////////////
  router.post('/interviews/create-interview',ensureAuthenticated,interviewController.getCreateInterviewpage);
  router.post('/interviews/post-create-interview',ensureAuthenticated,interviewController.postInterviewPage);
  router.post('/interviews/update-interview',ensureAuthenticated,interviewController.postInterviewUpdatePage);
  router.post('/interviews/confirm-delete',ensureAuthenticated,interviewController.postInterviewDeletePage);
////////////////////////////////////////////////////////////////////////////////////
  router.get('/interviews/confirmed-interviews/:page',ensureAuthenticated,interviewController.getConfirmedInterviews);
  router.get('/interviews/completed-interviews/:page',ensureAuthenticated,interviewController.getCompletedInterviews);
  router.get('/interviews/cancelled-interviews/:page',ensureAuthenticated,interviewController.getCancelledInterviews);
  router.get('/interviews/tentative-interviews/:page',ensureAuthenticated,interviewController.getTentativeInterviews);
  router.get('/interviews/all-interviews',ensureAuthenticated,interviewController.getAllInterviews);


module.exports = router;
