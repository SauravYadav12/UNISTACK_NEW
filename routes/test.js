const express = require("express");
const passport = require("passport");
const testController = require("../controllers/testController");
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');


/////////////////////////TEST MODULE/////////////////////////////////////////////////

// ==========================GET REQUESTS================================================

//   router.get('/tests/test-dashboard',testController.getTestDashboardPage);
  router.get('/tests/get-test-details',ensureAuthenticated,testController.getTestDetailsPage);
  router.get('/tests/view-test/:testId',ensureAuthenticated,testController.getTestViewPage);
  router.get('/tests/update-test/:testId',ensureAuthenticated,testController.getUpdateTestPage);
  router.get('/tests/delete-test/:testId',ensureAuthenticated,testController.getDeleteTestPage);
  router.get('/tests/test-dashboard/:page',ensureAuthenticated,testController.getAllTestWithPageNumber);
// =======================================================================================

  router.post('/tests/create-test',ensureAuthenticated,testController.getCreateTestpage);
  router.post('/tests/post-create-test',ensureAuthenticated,testController.postTestCreatePage);
  router.post('/tests/post-update-test',ensureAuthenticated,testController.postTestUpdate);
  router.post('/tests/confirm-delete',ensureAuthenticated,testController.postTestDelete);


module.exports = router;
