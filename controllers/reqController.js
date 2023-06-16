const Unibase = require("../models/unibaseDB");
const User = require("../models/userDB");
const Interview = require('../models/interviewDB');
const excelJS = require('exceljs');
const Consultant = require("../models/consultant");

function checkDuplicate(str1, str2){
  str1 = str1.split(" ").join('').toLowerCase();
  str2 = str2.split(" ").join('').toLowerCase()
  let maxStr, minStr;
  if(str1.length > str2.length){
    maxStr = str1;
    minStr = str2;
  } else {
    maxStr = str2;
    minStr = str1;
  }
  
  if(maxStr.includes(minStr)){
    return true
  } else {
    return false
  }
}

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

exports.exportData = async (req,res) => {
  let perPage = 300
  let page = req.params.page || 1
  let userp = req.user.username
  const date = Date.now();

  const records = await Unibase.find({}).sort({"_id":-1}).skip((perPage * page) - perPage).limit(perPage).exec();
  const workbook = new excelJS.Workbook();  // Create a new workbook
  const worksheet = workbook.addWorksheet("requirements"); // New Worksheet
  // const desktopDir = path.join(os.homedir(), "Desktop");
  // console.log("path",desktopDir);
  // const newPath = `${desktopDir}`;  // Path to download excel
    // Column for data in excel. key must match data key
    worksheet.columns = [
      { header: "Req ID", key: "reqID" }, 
      { header: "Assigned To", key: "assignedTo"},
      { header: "Applied For", key: "appliedFor"},
      { header: "Client Name", key: "clientCompany"},
      { header: "Req Status", key: "reqStatus"},
      { header: "Next Step", key: "nextStep"},
      { header: "Vendor Company", key: "vendorCompany"},
      { header: "Vendor Person", key: "vendorPersonName"},
      { header: "Vendor Email", key: "vendorEmail"},
      { header: "Prime vendor Company", key: "primeVendorCompany"},
      { header: "Vendor Phone", key: "vendorPhone"},
      { header: "Requirement Title", key: "jobTitle"},
      { header: "Created By", key: "recordOwner"},
      { header: "Created At", key: "createdAt"},
  ];
  // Looping through User data
  // let counter = 1;
  records.forEach((record) => {
    // user.s_no = counter;
    worksheet.addRow(record); // Add data in worksheet
    // counter++;
  });

  // Making first line in excel bold
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });
  try {
    await workbook.xlsx.writeFile(`requirements-p${page}.xlsx`)
     .then(() => {
        res.download(`requirements-p${page}.xlsx`)
     });
  } catch (err) {
      res.send({
      status: "error",
      message: "Something went wrong",
    });
    }
}

exports.getSearchReq = (req, res) => {
  const userp = req.user.username;

  Unibase.find({}, (err, records) => {
  
    if (!err) {
      res.render("Dashboard", {
        path: "/home",
        records: records,
        docTitle: "UniStack || All Records",
        username: userp,
      });
    }
  });
};

exports.getDashboard1 = async(req,res)=>{
  const userp = req.user.username;
  
      res.render("reports/reports-dashboard", {
        path: "/reports-dashboard",
        docTitle: "UniStack || Reports",
        username: userp,
        role: req.user.role
      });
}


 exports.getHomePage = async(req, res, next) => {
  let userp = req.user.username
  let d = new Date();
  let date = formatDate(d.toLocaleString('en-US',{timeZone: 'America/New_York'}));
  const dateToday = formatDate(d);
  const dateYesterday = formatDate(d.setDate(d.getDate() - 1));

  let positionsToday = 0;
  let positionsYesterday = 0;
  let newWorkingToday = 0;
  let newWorkingYesterday = 0;
  let submittedToday = 0;
  let submittedYesterday = 0;

  const recordCount = await Unibase.countDocuments().exec();
  const completedIntCount = await Interview.find({interviewStatus:"Interview Completed"}).countDocuments().exec();
  const totalProjects = await Interview.find({result: "Offer"}).countDocuments().exec();
  const totalInterviews = await Interview.countDocuments().exec();
  const todaysInterview = await Interview.aggregate([{$match:{interviewDate:{$eq:dateToday}}},{$sort:{"interviewTime": 1}}]);

  const allRecords = await Unibase.aggregate([{
    $match:{
      reqEnteredDate:{
        $gte:dateYesterday,
        $lte:dateToday
      },
      isDuplicate:{ 
        $eq:"false"
      }
    }
  }]);

  for(let req of allRecords){
    if(req.reqEnteredDate === dateToday){
        positionsToday++;
        if(req.reqStatus === "New Working"){
          newWorkingToday++;
        } 
        if(req.reqStatus === "Submitted"){
          submittedToday++;
        } 
    } else if(req.reqEnteredDate === dateYesterday){
      positionsYesterday++;
      if(req.reqStatus === "New Working"){
        newWorkingYesterday++;
      }
      if(req.reqStatus === "Submitted"){
        submittedYesterday++;
      } 
    }
  }

  return res.render('home', {
    path: "/home",
    docTitle: "UniStack || Home",
    username: userp,
    email: req.user.email,
    totalInterviews,
    totalRecords: recordCount,
    completedInterviews: completedIntCount,
    totalProjects,
    dateNow: date,
    today:todaysInterview,
    role: req.user.role,
    positionsToday,
    positionsYesterday,
    newWorkingToday,
    submittedToday,
    newWorkingYesterday,
    submittedYesterday,
    dateToday,
    dateYesterday
  });

}

exports.getReqList = async(req, res, next) => {

  try {
    let perPage = 500
    let page = req.params.page || 1
    let userp = req.user.username
    const date = Date.now();

  const [records,count] = await Promise.all([ Unibase
    .find({})
    .sort({"_id":-1})
    .skip((perPage * page) - perPage)
    .limit(perPage), Unibase.countDocuments()])

    return res.render("requirements/reqlist",{
        path: "/requirements/reqlist/1",
        records: records,
        docTitle: "UniStack || Requirement List",
        username: userp,
        email: req.user.email,
        current: page,
        pages: Math.ceil(count / perPage),
        role: req.user.role,
      })
  } catch (error) {
      return res.status(400).json({
        sucess:"fail",
        message:"error"
      })
  }
  
}

exports.getCreateReqPage = async(req, res) => {
  //Grab current username
  const username = req.user.username;
  let error_create_record = "";

  // find All Users 
  const users = await User.find().select('_id username');

  // find All consultant 
  const consultants = await Consultant.find().select('_id consultantName psuedoName');
  //Find all Records

  const lastRec = await Unibase.find().sort({ createdAt: -1 }).limit(1);
  const newReqId = parseInt(lastRec[0].reqID) + 1
  // console.log("Last rec",newReqId);

  if(req.body.isDuplicate === 'true'){
    const record = await Unibase.findById(req.body.recordID);
    const {reqID,remote,duration,clientCompany,primeVendorCompany,vendorCompany,vendorEmail,vendorPersonName,vendorPhone,
      jobTitle,jobPortalLink,jobDescription, reqKeywords,primaryTech,secondaryTech, employementType, primaryTechStack,gotReqFrom} = record
  
    const lastRec = await Unibase.find().sort({ createdAt: -1 }).limit(1);
    const newReqId = parseInt(lastRec[0].reqID) + 1

    return res.render('requirements/createReq', {
      path: '/home',
      docTitle: 'Create Requirement',
      username: req.user.username,
      reqNumber:newReqId,
      status:"error",
      message:"Record Id already exists. Please create a new one",
      role: req.user.role,
      isDuplicate:req.body.isDuplicate,
      users,
      consultants,
      reqStatus:"New Working",
      assignedTo:'',
      appliedFor:'',
      taxType:'',
      mComment:'',
      duplicateWith: reqID,
      remote,duration,clientCompany,primeVendorCompany,vendorCompany,vendorEmail,vendorPersonName,vendorPhone,
      jobTitle,jobPortalLink,jobDescription,reqKeywords,employementType,primaryTechStack,gotReqFrom,primaryTech,secondaryTech
    });

  } else {
    return res.render('requirements/createReq', {
      path: '/home',
      docTitle: 'Create Requirement',
      username: username,
      role: req.user.role,
      error_create_record,
      reqNumber: newReqId,
      appliedFor:'',
      assignedTo:'',
      reqStatus:'',
      taxType:'',
      mComment:'',
      jobDescription:'',
      users,
      consultants,
      isDuplicate: 'false',
      duplicateWith:''
    });

  }

};

exports.postCreatePage = async(req, res) => {
  const author = req.user.username;
  let mComment = [];
  let rate;
  let taxType;
  let remote;
  let duration;
  let error_create_record;
  let companyMatch;
  let personMatch;
  let stackMatch;
  let duplicateRecords = [];

  let newDate = new Date();
  let today = formatDate(newDate);

  if(req.body.isDuplicate === 'false'){
    const TodaysRecord = await Unibase.aggregate([{
      $match:{
        reqEnteredDate:{
          $gte: today,
          $lte: today
        }
      }
    }]);

    TodaysRecord.forEach( record => {
      companyMatch = checkDuplicate(record.vendorCompany, req.body.vendorCompany);
      personMatch = checkDuplicate(record.vendorPersonName, req.body.vendorPersonName);
      if(record.primaryTechStack){
        stackMatch = checkDuplicate(record.primaryTechStack, req.body.primaryTechStack);
      } else {
        record.primaryTechStack = "No option"
        stackMatch = checkDuplicate(record.primaryTechStack, req.body.primaryTechStack);
      }

      if((companyMatch && personMatch && stackMatch) || (companyMatch && personMatch)){
        duplicateRecords.push(record.reqID);
      }
    });
  }

  if(duplicateRecords.length){
    req.flash('error', `Duplicate Record Exists With ID - ${duplicateRecords[0]}.`);
    res.redirect('/requirements/createReq');
  } else {
    const lastRec = await Unibase.find().sort({ createdAt: -1 }).limit(1);
    const newReqId = parseInt(lastRec[0].reqID) + 1

    req.body.reqID = newReqId;

    if (req.body.mComment != "") {
        mComment = [{
            comment: req.body.mComment,
            created_at: new Date(),
            user: author
        }]
    }

    if (req.body.rate !== "") {
        rate = req.body.rate;
    }

    if (req.body.taxType !== "") {
        taxType = req.body.taxType;
    }

    if (req.body.remote !== "") {
        remote = req.body.remote;
    }

    if (req.body.duration !== "") {
        duration = req.body.duration;
    }


    const newReq = new Unibase({

        reqID: req.body.reqID,
        reqStatus: req.body.reqStatus,
        nextStep: req.body.nextStep,
        appliedFor: req.body.appliedFor,
        assignedTo: req.body.assignedTo,
        resume: req.body.resume,
        mComment: mComment,
        rate: rate,
        taxType: taxType,
        remote: remote,
        duration: duration,
        clientCompany: req.body.clientCompany,
        clientWebsite: req.body.clientWebsite,
        clientAddress: req.body.clientAddress,
        clientPerson: req.body.clientPerson,
        clientPhone: req.body.clientPhone,
        clientEmail: req.body.clientEmail,
        primeVendorCompany: req.body.primeVendorCompany,
        primeVendorWebsite: req.body.primeVendorWebsite,
        primeVendorName: req.body.primeVendorName,
        primeVendorPhone: req.body.primeVendorPhone,
        primeVendorEmail: req.body.primeVendorEmail,
        vendorCompany: req.body.vendorCompany,
        vendorWebsite: req.body.vendorWebsite,
        vendorPersonName: req.body.vendorPersonName,
        vendorPhone: req.body.vendorPhone,
        vendorEmail: req.body.vendorEmail,
        reqEnteredDate: req.body.reqEnteredDate,
        gotReqFrom: req.body.gotReqFrom,
        gotOnResume: req.body.gotOnResume,
        jobTitle: req.body.jobTitle,
        employementType: req.body.employementType,
        jobPortalLink: req.body.jobPortalLink,
        reqEnteredBy: req.user.username,
        reqKeywords: req.body.reqKeywords,
        primaryTech:req.body.primaryTech,
        secondaryTech:req.body.secondaryTech,
        jobDescription: req.body.jobDescription,
        recordOwner: author,
        primaryTechStack:req.body.primaryTechStack,
        isDuplicate:req.body.isDuplicate,
        duplicateWith: req.body.duplicateWith
    });

    newReq.save(async(err) => {
      
      if (!err) {
            req.flash('success_msg', "Record Created Successfully")
            res.redirect('/requirements/reqlist/1');
        } else {

            error_create_record = 'Record ID already exists. New ID updated For you, Proceed to Save'
            req.flash('error_msg', error_create_record);
            const {reqStatus,nextStep,appliedFor,assignedTo,resume,mComment,rate,taxType,
                  remote,duration,clientCompany,primeVendorCompany,vendorCompany,vendorEmail,vendorPersonName,vendorPhone,reqEnteredDate,
                  jobTitle,jobPortalLink,jobDescription, reqKeywords, employementType, primaryTechStack,primaryTech,secondaryTech} = req.body;

            const lastRec = await Unibase.find().sort({ createdAt: -1 }).limit(1);
            const newReqId = parseInt(lastRec[0].reqID) + 1
            
            return res.render('requirements/createReq', {
              error_create_record,
              path: '/home',
              docTitle: 'Create Requirement',
              username: author,
              reqNumber:newReqId,
              status:"error",
              message:"Record Id already exists. Please create a new one",
              role: req.user.role,
              reqStatus,nextStep,appliedFor,assignedTo,resume,mComment,rate,taxType,
              remote,duration,clientCompany,primeVendorCompany,vendorCompany,vendorEmail,vendorPersonName,vendorPhone,reqEnteredDate,
              jobTitle,jobPortalLink,jobDescription,reqKeywords,employementType,primaryTechStack,primaryTech,secondaryTech
          });
            
        }
    });
  }

};

exports.getViewRecordPage = (req, res) => {
  const reqID = req.params.reqID;
  const user = req.user.username;

  Unibase.findOne({ reqID: reqID }, (err, foundRecord) => {
    if (!err) {
      res.render("requirements/viewReq", {
        docTitle: "View Requirement",
        path: "/home",
        recordID :foundRecord._id,
        reqID: foundRecord.reqID,
        reqStatus: foundRecord.reqStatus,
        nextStep: foundRecord.nextStep,
        assignedTo: foundRecord.assignedTo,
        appliedFor: foundRecord.appliedFor,
        resume: foundRecord.resume,
        rate: foundRecord.rate,
        taxType: foundRecord.taxType,
        remote: foundRecord.remote,
        duration: foundRecord.duration,
        mComment: foundRecord.mComment,
        clientCompany: foundRecord.clientCompany,
        clientWebsite: foundRecord.clientWebsite,
        clientAddress: foundRecord.clientAddress,
        clientPerson: foundRecord.clientPerson,
        clientPhone: foundRecord.clientPhone,
        clientEmail: foundRecord.clientEmail,
        primeVendorCompany: foundRecord.primeVendorCompany,
        primeVendorWebsite: foundRecord.primeVendorWebsite,
        primeVendorName: foundRecord.primeVendorName,
        primeVendorPhone: foundRecord.primeVendorPhone,
        primeVendorEmail: foundRecord.primeVendorEmail,
        vendorCompany: foundRecord.vendorCompany,
        vendorWebsite: foundRecord.vendorWebsite,
        vendorPersonName: foundRecord.vendorPersonName,
        vendorPhone: foundRecord.vendorPhone,
        vendorEmail: foundRecord.vendorEmail,
        reqEnteredDate: foundRecord.reqEnteredDate,
        gotReqFrom: foundRecord.gotReqFrom,
        gotOnResume: foundRecord.gotOnResume,
        jobTitle: foundRecord.jobTitle,
        employementType: foundRecord.employementType,
        jobPortalLink: foundRecord.jobPortalLink,
        reqEnteredBy: foundRecord.reqEnteredBy,
        reqKeywords: foundRecord.reqKeywords,
        primaryTech:foundRecord.primaryTech,
        secondaryTech:foundRecord.secondaryTech,
        jobDescription: foundRecord.jobDescription,
        createdAt: foundRecord.createdAt,
        updatedAt: foundRecord.updatedAt,
        recordOwner: foundRecord.recordOwner,
        updatedBy: foundRecord.updatedBy,
        interviews: foundRecord.interviews,
        username: user,
        email:req.user.email,
        role: req.user.role,
        primaryTechStack: foundRecord.primaryTechStack,
        isDuplicate:foundRecord.isDuplicate,
        duplicateWith:foundRecord.duplicateWith
      });
    } else {
      console.log(err);
    }
  });
};

exports.getUpdateReqPage = async(req, res) => {

  // find All Users 
  const users = await User.find().select('_id username');
  // find All consultant 
  const consultants = await Consultant.find().select('_id consultantName psuedoName');
  const reqID = req.params.reqID;

  Unibase.findOne({ reqID: reqID }, (err, foundRecord) => {
    if (!err) {
      res.render("requirements/updateReq", {
        path: "/home",
        docTitle: "Update Requirement",
        users,
        reqID: foundRecord.reqID,
        reqStatus: foundRecord.reqStatus,
        nextStep: foundRecord.nextStep,
        assignedTo: foundRecord.assignedTo,
        appliedFor: foundRecord.appliedFor,
        resume: foundRecord.resume,
        rate: foundRecord.rate,
        taxType: foundRecord.taxType,
        remote: foundRecord.remote,
        duration: foundRecord.duration,
        mComment: foundRecord.mComment,
        clientCompany: foundRecord.clientCompany,
        clientWebsite: foundRecord.clientWebsite,
        clientAddress: foundRecord.clientAddress,
        clientPerson: foundRecord.clientPerson,
        clientPhone: foundRecord.clientPhone,
        clientEmail: foundRecord.clientEmail,
        primeVendorCompany: foundRecord.primeVendorCompany,
        primeVendorWebsite: foundRecord.primeVendorWebsite,
        primeVendorName: foundRecord.primeVendorName,
        primeVendorPhone: foundRecord.primeVendorPhone,
        primeVendorEmail: foundRecord.primeVendorEmail,
        vendorCompany: foundRecord.vendorCompany,
        vendorWebsite: foundRecord.vendorWebsite,
        vendorPersonName: foundRecord.vendorPersonName,
        vendorPhone: foundRecord.vendorPhone,
        vendorEmail: foundRecord.vendorEmail,
        reqEnteredDate: foundRecord.reqEnteredDate,
        gotReqFrom: foundRecord.gotReqFrom,
        gotOnResume: foundRecord.gotOnResume,
        jobTitle: foundRecord.jobTitle,
        employementType: foundRecord.employementType,
        jobPortalLink: foundRecord.jobPortalLink,
        reqEnteredBy: foundRecord.reqEnteredBy,
        reqKeywords: foundRecord.reqKeywords,
        primaryTech:foundRecord.primaryTech,
        secondaryTech:foundRecord.secondaryTech,
        jobDescription: foundRecord.jobDescription,
        jobDescription: foundRecord.jobDescription,
        createdAt: foundRecord.createdAt,
        updatedAt: foundRecord.updatedAt,
        role: req.user.role,
        consultants,
        primaryTechStack: foundRecord.primaryTechStack
      });
    } else {
      console.log(err);
    }
  });
};

exports.postUpdateRecordPage = async(req, res) => {
  const reqID = req.body.reqID;
  const whoUpdateIt = req.user.username;
  if (req.body.mComment !== "") {
    Unibase.findOneAndUpdate(
      { reqID: reqID },
      {
        $push: {
          mComment: {
            comment: req.body.mComment,
            created_at: new Date(),
            user: req.user.username,
          },
        },
      },
      (err, record) => {
        if (!err) {
          record.save();
        }
      },
    );
  }

  if (req.body.rate !== "") {
    Unibase.findOneAndUpdate(
      { reqID: reqID },
      {
        $push: {
          rate: req.body.rate,
        },
      },
      (err, record) => {
        if (!err) {
          record.save();
        }
      },
    );
  }

  if (req.body.taxType !== "") {
    Unibase.findOneAndUpdate(
      { reqID: reqID },
      {
        $push: {
          taxType: req.body.taxType,
        },
      },
      (err, record) => {
        if (!err) {
          record.save();
        }
      },
    );
  }

  if (req.body.remote !== "") {
    Unibase.findOneAndUpdate(
      { reqID: reqID },
      {
        $push: {
          remote: req.body.remote,
        },
      },
      (err, record) => {
        if (!err) {
          record.save();
        }
      },
    );
  }

  if (req.body.duration !== "") {
    Unibase.findOneAndUpdate(
      { reqID: reqID },
      {
        $push: {
          duration: req.body.duration,
        },
      },
      (err, record) => {
        if (!err) {
          record.save();
        }
      },
    );
  }

  await Interview.updateMany({reqID:reqID},{clientName:req.body.clientCompany},{new:true});

  Unibase.findOneAndUpdate(
    {
      reqID: reqID,
    },
    {
      reqID: req.body.reqID,
      reqStatus: req.body.reqStatus,
      nextStep: req.body.nextStep,
      assignedTo: req.body.assignedTo,
      appliedFor: req.body.appliedFor,
      resume: req.body.resume,
      clientCompany: req.body.clientCompany,
      clientWebsite: req.body.clientWebsite,
      clientAddress: req.body.clientAddress,
      clientPerson: req.body.clientPerson,
      clientPhone: req.body.clientPhone,
      clientEmail: req.body.clientEmail,
      primeVendorCompany: req.body.primeVendorCompany,
      primeVendorWebsite: req.body.primeVendorWebsite,
      primeVendorName: req.body.primeVendorName,
      primeVendorPhone: req.body.primeVendorPhone,
      primeVendorEmail: req.body.primeVendorEmail,
      vendorCompany: req.body.vendorCompany,
      vendorWebsite: req.body.vendorWebsite,
      vendorPersonName: req.body.vendorPersonName,
      vendorPhone: req.body.vendorPhone,
      vendorEmail: req.body.vendorEmail,
      reqEnteredDate: req.body.reqEnteredDate,
      gotReqFrom: req.body.gotReqFrom,
      gotOnResume: req.body.gotOnResume,
      jobTitle: req.body.jobTitle,
      employementType: req.body.employementType,
      jobPortalLink: req.body.jobPortalLink,
      reqEnteredBy: req.body.reqEnteredBy,
      reqKeywords: req.body.reqKeywords,
      primaryTech:req.body.primaryTech,
      secondaryTech:req.body.secondaryTech,
      jobDescription: req.body.jobDescription,
      jobDescription: req.body.jobDescription,
      updatedBy: whoUpdateIt,
      role: req.user.role,
      primaryTechStack:req.body.primaryTechStack,
    },
    (err, record) => {
      if (!err) {
        req.flash('success_msg', "Record Updated Successfully");
        record.save();
      }
      res.redirect("/requirements/viewReq/" + reqID);
    },
  );
};

exports.getDeletePage = (req, res) => {
  const reqID = req.params.reqID;
  const user = req.user.username;

  Unibase.findOne({ reqID: reqID }, (err, foundRecord) => {
    if (!err) {
      res.render("requirements/deleteReq", {
        path: "/home",
        docTitle: "Delete Requirement",
        reqID: foundRecord.reqID,
        reqStatus: foundRecord.reqStatus,
        assignedTo: foundRecord.assignedTo,
        nextStep: foundRecord.nextStep,
        appliedFor: foundRecord.appliedFor,
        resume: foundRecord.resume,
        rate: foundRecord.rate,
        taxType: foundRecord.taxType,
        remote: foundRecord.remote,
        duration: foundRecord.duration,
        mComment: foundRecord.mComment,
        clientCompany: foundRecord.clientCompany,
        clientWebsite: foundRecord.clientWebsite,
        clientAddress: foundRecord.clientAddress,
        clientPerson: foundRecord.clientPerson,
        clientPhone: foundRecord.clientPhone,
        clientEmail: foundRecord.clientEmail,
        primeVendorCompany: foundRecord.primeVendorCompany,
        primeVendorWebsite: foundRecord.primeVendorWebsite,
        primeVendorName: foundRecord.primeVendorName,
        primeVendorPhone: foundRecord.primeVendorPhone,
        primeVendorEmail: foundRecord.primeVendorEmail,
        vendorCompany: foundRecord.vendorCompany,
        vendorWebsite: foundRecord.vendorWebsite,
        vendorPersonName: foundRecord.vendorPersonName,
        vendorPhone: foundRecord.vendorPhone,
        vendorEmail: foundRecord.vendorEmail,
        reqEnteredDate: foundRecord.reqEnteredDate,
        gotReqFrom: foundRecord.gotReqFrom,
        gotOnResume: foundRecord.gotOnResume,
        jobTitle: foundRecord.jobTitle,
        employementType: foundRecord.employementType,
        jobPortalLink: foundRecord.jobPortalLink,
        reqEnteredBy: foundRecord.reqEnteredBy,
        reqKeywords: foundRecord.reqKeywords,
        jobDescription: foundRecord.jobDescription,
        createdAt: foundRecord.createdAt,
        updatedAt: foundRecord.updatedAt,
        username: user,
        role: req.user.role,
        primaryTechStack:req.body.primaryTechStack
      });
    } else {
      console.log(err);
    }
  });
};

exports.postDeletePage = (req, res) => {
  const reqID = req.body.reqID;

  Unibase.findOneAndRemove({ reqID: reqID }, (err) => {
    if (!err) {
      req.flash('success_msg', "Record Deleted Successfully")
      res.redirect("/requirements/reqList/1");

    }
  });

};

exports.getWeeklydataForchart = async(req,res)=>{

  const lastWeek = [];
  function getLastWeek() {
    let today = new Date();  
    let day = today.getDay();
    let t = day-1;    
    let monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - t - 7); //monday from last week
    let friday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - t - 3); //friday from ast week
    return [monday, friday];
  }
  const [monday,friday] = getLastWeek();

  const lastWeekRecord = await Unibase.aggregate([{
    $match:{
      reqEnteredDate:{
        $gte: formatDate(monday),
        $lte: formatDate(friday)
      }
    }
  }])
  
  for(let record of lastWeekRecord){
    if(lastWeek.length){
      const i = lastWeek.findIndex( e => e.date === record.reqEnteredDate);
      if(i > -1){
        lastWeek[i].positions = lastWeek[i].positions + 1 || 1
      } else {
        const data = {};
        data.date = record.reqEnteredDate
        data.positions = data.positions + 1 || 1
        lastWeek.push(data);
      }
    } else {
      const data = {};
      data.date = record.reqEnteredDate
      data.positions = data.positions + 1 || 1
      lastWeek.push(data);
    }
  }

  lastWeek.sort(function(a,b){
    return new Date(a.date) - new Date(b.date);
  });

  return lastWeek;
  
}