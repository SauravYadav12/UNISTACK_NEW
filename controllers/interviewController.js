const mongoose = require('mongoose');
const Unibase = require('../models/unibaseDB');
const User = require('../models/userDB');
const Interview = require('../models/interviewDB');


function formatDate(date) {
    var offset = -300; //Timezone offset for EST in minutes.
    // var estDate = new Date(dt.getTime() + offset*60*1000)
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


exports.getDashboardPage = (req, res) => {
    const username = req.user.username;
    let perPage = 100
    let page = req.params.page || 1
    let d = new Date();
    let date = formatDate(d)
  
    Interview
        .find()
        .sort({"_id":-1})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec({}, (err, interview) => {
        let interviewToday = [];
        for (i = 0; i < interview.length; i++) {
            if(interview[i].interviewDate == date){
                interviewToday.push(interview[i]);
            }
        };

        if (!err) {

            res.render('interviews/dashboard', {
                path: '/interviews/dashboard',
                docTitle: "Interview DashBoard",
                current: page,
                dateNow: date,
                pages: Math.ceil(interviewToday.length / perPage),
                today: interviewToday.slice().reverse(),
                username: username,
                role:req.user.role
            });
        }
    });
};

exports.getAllInterviews = async(req,res,next)=>{
    let userp = req.user.username
    try {
        const records = await Interview.find().sort({createdAt:-1});

        res.render('interviews/all-interviews', {
            path: "/interviews/all-interviews",
            interviews: records,
            docTitle: "UniStack || interviews",
            username: userp,
            email: req.user.email,
            role:req.user.role
          })

    } catch (error) {
        res.status(400).json({
            status:"fail",
            message:"Cannot fetch records"
        })
    }
}


exports.getConfirmedInterviews = (req,res,next)=>{
  let perPage = 10
  let page = req.params.page || 1
  let userp = req.user.username
  let d = new Date();
  let date = formatDate(d)
    console.log("date", date);
  Interview
      .find({interviewStatus:"Interview Confirm"})
      .sort({"_id":-1})
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function(err, records) {
            
            Interview.where({interviewStatus:"Interview Confirm"}).countDocuments(function(err, count) {

              if (err) return next(err)
              res.render('interviews/confirmed-interviews', {
                path: "/interviews/confirmed-interviews",
                confirm: records,
                docTitle: "UniStack || interviews",
                username: userp,
                email: req.user.email,
                current: page,
                dateNow: date,
                pages: Math.ceil(count / perPage),
                role:req.user.role
              })
        })
      })
}


exports.getCompletedInterviews = (req,res,next)=>{

  let perPage = 20
  let page = req.params.page || 1
  let userp = req.user.username
  let d = new Date();
  let date = formatDate(d);

  Interview
      .find({interviewStatus:"Interview Completed"})
      .sort({"_id":-1})
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function(err, records) {
        Interview.where({interviewStatus:"Interview Completed"}).countDocuments(function(err, count) {
              if (err) return next(err)
              res.render('interviews/completed-interviews', {
                path: "/interviews/completed-interviews",
                completed: records,
                docTitle: "UniStack || interviews",
                username: userp,
                email: req.user.email,
                current: page,
                dateNow: date,
                pages: Math.ceil(count / perPage),
                role:req.user.role
              })
           })
      })
}

exports.getCancelledInterviews = (req,res,next)=>{

    let perPage = 20
    let page = req.params.page || 1
    let userp = req.user.username
    let d = new Date();
    let date = formatDate(d);
  
    Interview
        .find({interviewStatus:"Interview Cancelled"})
        .sort({"_id":-1})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, records) {
          Interview.where({interviewStatus:"Interview Cancelled"}).countDocuments(function(err, count) {
                if (err) return next(err)
                res.render('interviews/cancelled-interviews', {
                  path: "/interviews/cancelled-interviews",
                  cancelled: records,
                  docTitle: "UniStack || interviews",
                  username: userp,
                  email: req.user.email,
                  current: page,
                  dateNow: date,
                  pages: Math.ceil(count / perPage),
                  role:req.user.role
                })
             })
        })
}

  
exports.getTentativeInterviews = (req,res,next)=>{

    let perPage = 10
    let page = req.params.page || 1
    let userp = req.user.username
    let d = new Date();
    let date = formatDate(d);
  
    Interview
        .find({interviewStatus:"Interview Tentative"})
        .sort({"_id":-1})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, records) {
          Interview.where({interviewStatus:"Interview Tentative"}).countDocuments(function(err, count) {
                if (err) return next(err);
                res.render('interviews/tentative-interviews', {
                  path: "/interviews/tentative-interviews",
                  tentative: records,
                  docTitle: "UniStack || interviews",
                  username: userp,
                  email: req.user.email,
                  current: page,
                  dateNow: date,
                  pages: Math.ceil(count / perPage),
                  role:req.user.role
                })
             })
        })
}
  


exports.getInterviewDetailsPage = async(req, res) => {
    let userp = req.user.username
    let perPage = 1000
    Unibase
      .find({})
      .sort({"_id":-1})
      .limit(perPage)
      .exec(function(err, records) {
        if (!err) {
            res.render('interviews/getInterviewDetails', {
                path: '/interviews/dashboard',
                docTitle: 'Enter Interview Details',
                records: records.reverse(),
                username:userp,
                email:req.user.email,
                role:req.user.role
            });
        }
      })
    
};


exports.getCreateInterviewpage = async(req, res) => {

    try {
        const lastRec = await Interview.find().sort({ createdAt: -1 }).limit(1);
        const foundRecord = await Unibase.findById(req.body.recordID);
    
        if(lastRec.length){
           newId = parseInt(lastRec[0].intId) + 1
        } else {
           newId =  1 ;
        }
    
        return res.render('interviews/createInterview', {
            path: '/interviews/dashboard',
            docTitle: 'Create Interview',
            reqID: foundRecord.reqID,
            recordId:foundRecord._id,
            intId: newId,
            marketingPerson:foundRecord.assignedTo,
            vendorCompany: foundRecord.vendorCompany,
            jobTitle: foundRecord.jobTitle,
            primeVendorCompany: foundRecord.primeVendorCompany,
            consultant: foundRecord.appliedFor,
            jobDescription: foundRecord.jobDescription,
            clientName: foundRecord.clientCompany,
            taxType: foundRecord.taxType,
            duration: foundRecord.duration,
            username: req.user.username,
            role:req.user.role
        });
        
    } catch (error) {
        console.log(error);   
    }
   
}



exports.postInterviewPage = async(req, res) => {

    try {
        console.log(req.body);
        const lastRec = await Interview.find().sort({ createdAt: -1 }).limit(1);
    
        if(lastRec.length){
           const newId = parseInt(lastRec[0].intId) + 1
            req.body.intId = newId;

        } else {
          const newId =  1 ;
          req.body.intId = newId;
        }

        const int = await Interview.create(req.body);
        const req = await Unibase.findByIdAndUpdate(int.recordId,{$push:{interviewId:{id:int._id, round: int.interviewRound}}},{new:true});
        res.redirect('/interviews/confirmed-interviews/1');
        
    } catch (error) {
        console.log(error);
    }   
};



exports.getInterviewViewPage = (req, res) => {
    const intId = req.params.intId;
    const username = req.user.username;


    Interview.findOne({
        intId: intId
    }, (err, foundInt) => {
        const reqID = foundInt.reqID;
        Unibase.findOne({
            reqID: reqID
        }, (err, foundRecord) => {

            if (!err) {
                res.render('interviews/viewInterviews', {
                    path: '/interviews/dashboard',
                    docTitle: 'View interview',
                    intId: foundInt.intId,
                    interviewDate: foundInt.interviewDate,
                    interviewTime: foundInt.interviewTime,
                    interviewType: foundInt.interviewType,
                    interviewLink: foundInt.interviewLink,
                    interviewStatus: foundInt.interviewStatus,
                    consultant: foundRecord.appliedFor,
                    marketingPerson: foundInt.marketingPerson,
                    vendorCompany: foundRecord.vendorCompany,
                    primeVendorCompany: foundRecord.primeVendorCompany,
                    gitHubLink: foundInt.gitHubLink,
                    codeLink: foundInt.codeLink,
                    result: foundInt.result,
                    subjectLine: foundInt.subjectLine,
                    interviewMode: foundInt.interviewMode,
                    interviewFocus: foundInt.interviewFocus,
                    jobDescription: foundRecord.jobDescription,
                    interviewFeedback: foundInt.interviewFeedback,
                    taxType: foundRecord.taxType,
                    clientName: foundRecord.clientCompany,
                    duration: foundRecord.duration,
                    candidateName: foundInt.candidateName,
                    rateForInterview: foundInt.rateForInterview,
                    paymentStatus: foundInt.paymentStatus,
                    createdAt: foundInt.createdAt,
                    updatedAt: foundInt.updatedAt,
                    jobTitle: foundRecord.jobTitle,
                    tentativeReason:foundInt.tentativeReason,
                    reqID: foundInt.reqID,
                    recordOwner: foundInt.recordOwner,
                    updatedBy: foundInt.updatedBy,
                    username: username,
                    role:req.user.role,
                });
            }
        });
    });
};


exports.getInterviewUpdatePage = (req, res) => {
    const intId = req.params.intId;
    const username = req.user.username;

    Interview.findOne({
        intId: intId
    }, (err, foundInt) => {

        Unibase.findOne({
            reqID: foundInt.reqID
        }, (err, foundRecord) => {
            
            if (!err) {
                res.render('interviews/updateInterview', {
                    path: '/interviews/dashboard',
                    docTitle: 'update Interview',
                    intId: foundInt.intId,
                    interviewDate: foundInt.interviewDate,
                    interviewTime: foundInt.interviewTime,
                    interviewType: foundInt.interviewType,
                    interviewStatus: foundInt.interviewStatus,
                    interviewLink: foundInt.interviewLink,
                    consultant: foundRecord.appliedFor,
                    marketingPerson: foundInt.marketingPerson,
                    vendorCompany: foundRecord.vendorCompany,
                    primeVendorCompany: foundRecord.primeVendorCompany,
                    gitHubLink: foundInt.gitHubLink,
                    codeLink: foundInt.codeLink,
                    result: foundInt.result,
                    subjectLine: foundInt.subjectLine,
                    interviewMode: foundInt.interviewMode,
                    interviewFocus: foundInt.interviewFocus,
                    jobDescription: foundRecord.jobDescription,
                    interviewFeedback: foundInt.interviewFeedback,
                    taxType: foundRecord.taxType,
                    clientName: foundRecord.clientCompany,
                    duration: foundRecord.duration,
                    candidateName: foundInt.candidateName,
                    rateForInterview: foundInt.rateForInterview,
                    paymentStatus: foundInt.paymentStatus,
                    createdAt: foundInt.createdAt,
                    updatedAt: foundInt.updatedAt,
                    reqID: foundRecord.reqID,
                    jobTitle: foundRecord.jobTitle,
                    tentativeReason: foundInt.tentativeReason,
                    recordOwner: foundInt.recordOwner,
                    updatedBy: foundInt.updatedBy,
                    username: username,
                    role:req.user.role,
                });
            }
        });
    });
};

exports.postInterviewUpdatePage = async(req, res) => {
    const intId = req.body.intId;
    const updatedBy = req.user.username;
    const role = req.user.role
    req.body.updatedBy = req.user.username
    let interviewee;

    const record = await Interview.findOne({intId:intId});
    Unibase.findOne({reqID:record.reqID}, (err, rec)=>{
        req.body.clientName = rec.clientCompany;
    })
    if(role === "Admin" || role === "SuperAdmin"){
        interviewee = req.body.candidateName;
    } else {
        interviewee = record.candidateName;
    }
    const updatedRec = await Interview.findByIdAndUpdate(record._id, req.body, {new:true});
    res.redirect('/interviews/view-interviews/' + record.intId);
};


exports.getInterviewDeletePage = (req, res) => {
    const intId = req.params.intId;
    const username = req.user.username;

    Interview.findOne({
        intId: intId
    }, (err, foundInt) => {
        if (!err) {
            res.render('interviews/deleteInterview', {
                path: '/interviews/dashboard',
                docTitle: 'delete interview',
                intId: foundInt.intId,
                interviewDate: foundInt.interviewDate,
                interviewTime: foundInt.interviewTime,
                interviewType: foundInt.interviewType,
                interviewStatus: foundInt.interviewStatus,
                consultant: foundInt.consultant,
                marketingPerson: foundInt.marketingPerson,
                vendorCompany: foundInt.vendorCompany,
                primeVendorCompany: foundInt.primeVendorCompany,
                gitHubLink: foundInt.gitHubLink,
                codeLink: foundInt.codeLink,
                result: foundInt.result,
                subjectLine: foundInt.subjectLine,
                interviewMode: foundInt.interviewMode,
                interviewFocus: foundInt.interviewFocus,
                jobDescription: foundInt.jobDescription,
                interviewFeedback: foundInt.interviewFeedback,
                taxType: foundInt.taxType,
                clientName: foundInt.clientName,
                duration: foundInt.duration,
                candidateName: foundInt.candidateName,
                rateForInterview: foundInt.rateForInterview,
                paymentStatus: foundInt.paymentStatus,
                createdAt: foundInt.createdAt,
                updatedAt: foundInt.updatedAt,
                reqID: foundInt.reqID,
                recordOwner: foundInt.recordOwner,
                tentativeReason: foundInt.tentativeReason,
                updatedBy: foundInt.updatedBy,
                username: username,
                role:req.user.role,
            });
        }
    });
};



exports.postInterviewDeletePage = (req, res) => {
    const intId = req.body.intId;

    Interview.findOneAndRemove({
        intId: intId
    }, (err) => {
        if (!err) {
            console.log('Interview Deleted Successfully');
        }
    });

    res.redirect('/interviews/dashboard/1');
};