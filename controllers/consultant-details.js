const mongoose = require('mongoose');
const reqModel = require('../models/unibaseDB');
const userModel = require('../models/userDB');
const interviewModel = require('../models/interviewDB');
const User = mongoose.model('user',userModel.userSchema);
const Unibase = mongoose.model('unibase',reqModel.unibaseSchema);
const Interview = mongoose.model('interview',interviewModel.interviewSchema);


exports.getConsultantDetails = (req,res)=>{
    const username = req.user.username;
    res.render('consultant_details/consultant_details',{
        path:'/consultant_details/consultant_details',
        docTitle:"Consultant Details",
        username:username
    });

};