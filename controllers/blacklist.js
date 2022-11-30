const mongoose = require('mongoose');
const reqModel = require('../models/unibaseDB');
const userModel = require('../models/userDB');
const interviewModel = require('../models/interviewDB');
const User = mongoose.model('user',userModel.userSchema);
const Unibase = mongoose.model('unibase',reqModel.unibaseSchema);
const Interview = mongoose.model('interview',interviewModel.interviewSchema);

exports.getBlacklistHome = (req,res)=>{
    const username = req.user.username;
    res.render('blacklist-details/blacklist-home',{
        path:'/blacklist-details/blacklist-home',
        docTitle:"Blacklist Details",
        username:username
    });
}

exports.getClientBlacklistHome = (req,res)=>{
    const username = req.user.username;
    res.render('blacklist-details/client-blacklist-details',{
        path:'/blacklist-details/blacklist-home',
        docTitle:"Client Blacklist Details",
        username:username
    });
}

exports.getPrimeVendorBlacklistHome = (req,res)=>{
    const username = req.user.username;
    res.render('blacklist-details/prime-vendor-blacklist-details',{
        path:'/blacklist-details/blacklist-home',
        docTitle:"PV Blacklist Details",
        username:username
    });
}

exports.getVendorBlacklistHome = (req,res)=>{
    const username = req.user.username;
    res.render('blacklist-details/vendor-blacklist-details',{
        path:'/blacklist-details/blacklist-home',
        docTitle:"Blacklist Details",
        username:username
    });
}