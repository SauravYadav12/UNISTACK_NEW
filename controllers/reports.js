const Unibase = require("../models/unibaseDB");
const User = require("../models/userDB");
const Interview = require('../models/interviewDB');
const Consultant = require("../models/consultant");


exports.getSupportDashboard = async(req,res) =>{
    res.render('reports/support',{
        path: "/reports",
        docTitle: "UniStack || Reports",
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
    })
}

exports.getMarketingDashboard = async(req,res) =>{
    res.render('reports/marketing',{
        path: "/reports",
        docTitle: "UniStack || Reports",
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
    })
}