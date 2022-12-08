const express = require("express");
const passport = require("passport");
const Consultant = require("../controllers/consultant");
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');


router.get('/consultant-list',ensureAuthenticated,Consultant.getConsultantDetails);
router.get('/add-consultant',ensureAuthenticated,Consultant.getCreateConsultant);
router.post('/create-consultant',ensureAuthenticated,Consultant.postCreateConsultant);
router.get('/view-consultant/:id',ensureAuthenticated,Consultant.getConsultant);
router.get('/get-update-consultant/:id',ensureAuthenticated,Consultant.getConsultant);
router.post('/update-consultant/:id',ensureAuthenticated,Consultant.postUpdateConsultant);


module.exports = router;    