const Unibase = require("../models/unibaseDB");
const User = require("../models/userDB");
const Interview = require('../models/interviewDB');
const excelJS = require('exceljs');
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

exports.exportData = async (req,res) => {
  let perPage = 300
  let page = req.params.page || 1
  let userp = req.user.username
  const date = Date.now();
  console.log("landing date--", page);

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

  const recordCount = await Unibase.countDocuments().exec();
  const completedIntCount = await Interview.find({interviewStatus:"Interview Completed"}).countDocuments().exec();
  const totalProjects = await Interview.find({result: "Offer"}).countDocuments().exec();
  const todaysInterview = await Interview.find({interviewDate:date});
  const totalInterviews = await Interview.countDocuments().exec();

  // console.log(new Date(2023,01,30))
  const dateToday = formatDate(d);
  const dateYesterday = formatDate(d.setDate(d.getDate() - 1));
  const recYesterday = await Unibase.find({reqEnteredDate: dateYesterday}).countDocuments();
  const recToday = await Unibase.find({reqEnteredDate: dateToday}).countDocuments();
  const newWorkings = await Unibase.find({reqEnteredDate:dateToday, reqStatus:"New Working"}).countDocuments();
  const submittedToday = await Unibase.find({reqEnteredDate:dateToday, reqStatus:"Submitted"}).countDocuments();
  const newWorkingsYesterday = await Unibase.find({reqEnteredDate:dateYesterday, reqStatus:"New Working"}).countDocuments();
  const submittedYesterday = await Unibase.find({reqEnteredDate:dateYesterday, reqStatus:"Submitted"}).countDocuments();

  // console.log(submittedToday);

  // console.log(recToday);
  // console.log(recYesterday);

  // console.log(newRec.length);

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
    recToday,
    recYesterday,
    newWorkings,
    submittedToday,
    newWorkingsYesterday,
    submittedYesterday
  });

}

exports.getReqList = async(req, res, next) => {

  try {
    let perPage = 300
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
        role: req.user.role
      })
  } catch (error) {
      return res.status(400).json({
        sucess:"fail",
        message:error
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
    consultants
});
};

exports.postCreatePage = async(req, res) => {
  const author = req.user.username;
  let mComment = [];
  let rate;
  let taxType;
  let remote;
  let duration;
  let error_create_record;

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
      reqEnteredBy: req.body.reqEnteredBy,
      reqKeywords: req.body.reqKeywords,
      jobDescription: req.body.jobDescription,
      recordOwner: author,
  });
  

  newReq.save(async(err) => {
    
    if (!err) {
          console.log("Record Created Successfully");
          res.redirect('/requirements/reqlist/1');
      } else {

          error_create_record = 'Record ID already exists. New ID updated For you, Proceed to Save'
          const {reqStatus,nextStep,appliedFor,assignedTo,resume,mComment,rate,taxType,
                remote,duration,clientCompany,primeVendorCompany,vendorCompany,vendorEmail,vendorPersonName,vendorPhone,reqEnteredDate,
                jobTitle,jobPortalLink,jobDescription, reqKeywords, employementType} = req.body;

          const lastRec = await Unibase.find().sort({ createdAt: -1 }).limit(1);
          const newReqId = parseInt(lastRec[0].reqID) + 1

          return res.render('requirements/createReq', {
            error_create_record,
            path: '/home',
            docTitle: 'Create Requirement',
            username: author,
            reqNumber:newReqId,
            role: req.user.role,
            reqStatus,nextStep,appliedFor,assignedTo,resume,mComment,rate,taxType,
            remote,duration,clientCompany,primeVendorCompany,vendorCompany,vendorEmail,vendorPersonName,vendorPhone,reqEnteredDate,
            jobTitle,jobPortalLink,jobDescription,reqKeywords,employementType,
        });
          
      }
  });
};



exports.getViewRecordPage = (req, res) => {
  const reqID = req.params.reqID;
  const user = req.user.username;

  Unibase.findOne({ reqID: reqID }, (err, foundRecord) => {
    if (!err) {
      res.render("requirements/viewReq", {
        docTitle: "View Requirement",
        path: "/home",
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
        jobDescription: foundRecord.jobDescription,
        createdAt: foundRecord.createdAt,
        updatedAt: foundRecord.updatedAt,
        recordOwner: foundRecord.recordOwner,
        updatedBy: foundRecord.updatedBy,
        interviews: foundRecord.interviews,
        username: user,
        email:req.user.email,
        role: req.user.role,
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
        jobDescription: foundRecord.jobDescription,
        createdAt: foundRecord.createdAt,
        updatedAt: foundRecord.updatedAt,
        role: req.user.role,
        consultants,
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
          console.log("Comment saved Successfully");
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
          console.log("Rate saved Successfully");
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
          console.log("TaxType saved Successfully");
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
          console.log("Remote saved Successfully");
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
          console.log("Duration saved Successfully");
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
      jobDescription: req.body.jobDescription,
      updatedBy: whoUpdateIt,
      role: req.user.role,
    },
    (err, record) => {
      if (!err) {
        record.save();
        console.log("Record Updated Successfully");
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
      console.log("Record Deleted Successfully!");
    }
  });

  res.redirect("/home/1");
};
