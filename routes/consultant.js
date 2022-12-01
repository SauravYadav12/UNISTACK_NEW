const express = require("express");
const passport = require("passport");
const Consultant = require("../controllers/consultant-details");
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');


router.get('/consultant-details',ensureAuthenticated,Consultant.getConsultantDetails);
// router.post('/create-consultant',Consultant.create);
// router.get('/show-consultant/:id', Consultant.showConsultant);
// router.patch('/update-consultant/:id',Consultant.update);


module.exports = router;