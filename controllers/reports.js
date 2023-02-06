const Unibase = require("../models/unibaseDB");
const User = require("../models/userDB");
const Interview = require('../models/interviewDB');
const Consultant = require("../models/consultant");

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
  
    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
  
    return [year, month, day].join('-');
  };

function countPositions(arr) {
    let chars = {};
    let newArr = [];
    let status = {}
    for (let name of arr){
        chars[name.recordOwner] = chars[name.recordOwner] + 1 || 1
        status[name.reqStatus] = status[name.reqStatus] + 1 || 1;
    }

    console.log("Chars", chars, status);
    newArr = Object.entries(chars).map((e) => ( {name:e[0],positionCount:e[1]}));
    // console.log(newArr)
    return newArr
}

function checkStatus(positionStatus){
    
}

exports.getSupportDashboard = async(req,res) =>{
    const d = new Date();
    const dateToday = formatDate(d);
    
    const positionsToday = await Unibase.find({reqEnteredDate:dateToday}).select('_id recordOwner reqStatus');
    // const positionStatus = await Unibase.find({reqEnteredDate:dateToday}).select('_id recordOwner reqStatus');

    const support = countPositions(positionsToday);

    // console.log(positionStatus);
    return res.render('reports/support',{
        path: "/reports",
        docTitle: "UniStack || Reports",
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        dateToday,
        support,
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