const Unibase = require('../models/unibaseDB');
const Interview = require('../models/interviewDB');
const Consultant = require('../models/consultant');
const excelJS = require('exceljs');



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

exports.exportData = async (req, res) => {

    // let userp = req.user.username
    // const date = Date.now();

    const records = await Interview.find({}).sort({ "_id": -1 }).exec();
    const workbook = new excelJS.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("Interviews"); // New Worksheet
    // const desktopDir = path.join(os.homedir(), "Desktop");
    // console.log("path",desktopDir);
    // const newPath = `${desktopDir}`;  // Path to download excel
    // Column for data in excel. key must match data key
    worksheet.columns = [
        { header: "Int ID", key: "intId" },
        { header: "Int Status", key: "interviewStatus" },
        { header: "Consultant", key: "consultant" },
        { header: "Int date", key: "interviewDate" },
        { header: "Int Time(EST)", key: "interviewTime" },
        { header: "Int Result", key: "result" },
        { header: "Subject Line", key: "subjectLine" },
        { header: "Client Name", key: "clientName" },
        { header: "Job Title", key: "jobTitle" },
        { header: "Created by", key: "recordOwner" },
        { header: "Created At", key: "createdAt" },
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
        await workbook.xlsx.writeFile(`interviews.xlsx`)
            .then(() => {
                res.download(`interviews.xlsx`)
            });
    } catch (err) {
        res.send({
            status: "error",
            message: "Something went wrong",
        });
    }
}

exports.getDashboardPage = async (req, res) => {
    const username = req.user.username;
    let perPage = 20
    let page = req.params.page || 1
    let d = new Date();
    let date = formatDate(d)
    let skip = (perPage * page) - perPage
    console.log(date);
    let records = await Interview.aggregate([{
        $match: {
            interviewDate: {
                $eq: date,
            }
        }
    },
    { $sort: { "interviewDate": 1 } },
    ]);

    res.render('interviews/dashboard', {
        path: '/interviews/dashboard',
        docTitle: "Interview DashBoard",
        current: page,
        dateNow: date,
        pages: Math.ceil(records.length / perPage),
        today: records,
        username: username,
        role: req.user.role
    });
};

exports.getAllInterviews = async (req, res, next) => {
    let userp = req.user.username
    try {
        const records = await Interview.find().sort({ createdAt: -1 });

        res.render('interviews/all-interviews', {
            path: "/interviews/all-interviews",
            interviews: records,
            docTitle: "UniStack || interviews",
            username: userp,
            email: req.user.email,
            role: req.user.role
        })

    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: "Cannot fetch records"
        })
    }
}


exports.getConfirmedInterviews = async (req, res, next) => {
    let perPage = 10
    let page = req.params.page || 1
    let userp = req.user.username
    let d = new Date();
    let date = formatDate(d)
    let skip = (perPage * page) - perPage
    let total = await Interview.find({ interviewStatus: "Interview Confirm" }).count();


    let records = await Interview.aggregate([{
        $match: {
            interviewStatus: {
                $eq: "Interview Confirm"
            }
        }
    },
    { $sort: { "interviewDate": 1 } },
    { $skip: skip },
    { $limit: perPage },
    ]);

    return res.render('interviews/confirmed-interviews', {
        path: "/interviews/confirmed-interviews",
        confirm: records,
        docTitle: "UniStack || interviews",
        username: userp,
        email: req.user.email,
        current: page,
        dateNow: date,
        pages: Math.ceil(total / perPage),
        role: req.user.role
    });
}


exports.getCompletedInterviews = async (req, res, next) => {

    let perPage = 20
    let page = req.params.page || 1
    let userp = req.user.username
    let d = new Date();
    let date = formatDate(d);
    let skip = (perPage * page) - perPage
    let total = await Interview.find({ interviewStatus: "Interview Completed" }).count();


    let records = await Interview.aggregate([{
        $match: {
            interviewStatus: {
                $eq: "Interview Completed"
            }
        }
    },
    { $sort: { "interviewDate": -1 } },
    { $skip: skip },
    { $limit: perPage },
    ]);

    return res.render('interviews/completed-interviews', {
        path: "/interviews/completed-interviews",
        completed: records,
        docTitle: "UniStack || interviews",
        username: userp,
        email: req.user.email,
        current: page,
        dateNow: date,
        pages: Math.ceil(total / perPage),
        role: req.user.role
    });
}

exports.getCancelledInterviews = (req, res, next) => {

    let perPage = 20
    let page = req.params.page || 1
    let userp = req.user.username
    let d = new Date();
    let date = formatDate(d);

    Interview
        .find({ interviewStatus: "Interview Cancelled" })
        .sort({ "_id": -1 })
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function (err, records) {
            Interview.where({ interviewStatus: "Interview Cancelled" }).countDocuments(function (err, count) {
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
                    role: req.user.role
                })
            })
        })
}


exports.getTentativeInterviews = async (req, res, next) => {

    let perPage = 10
    let page = req.params.page || 1
    let userp = req.user.username
    let d = new Date();
    let date = formatDate(d);
    let skip = (perPage * page) - perPage
    let total = await Interview.find({ interviewStatus: "Interview Tentative" }).count();
    let records = await Interview.aggregate([{
        $match: {
            interviewStatus: {
                $eq: "Interview Tentative"
            }
        }
    },
    { $sort: { "interviewDate": -1 } },
    { $skip: skip },
    { $limit: perPage },
    ]);


    return res.render('interviews/tentative-interviews', {
        path: "/interviews/tentative-interviews",
        tentative: records,
        docTitle: "UniStack || interviews",
        username: userp,
        email: req.user.email,
        current: page,
        dateNow: date,
        pages: Math.ceil(total / perPage),
        role: req.user.role
    })
}



exports.getInterviewDetailsPage = async (req, res) => {
    let userp = req.user.username
    let perPage = 1000
    Unibase
        .find({})
        .sort({ "_id": -1 })
        .limit(perPage)
        .exec(function (err, records) {
            if (!err) {
                res.render('interviews/getInterviewDetails', {
                    path: '/interviews/dashboard',
                    docTitle: 'Enter Interview Details',
                    records: records.reverse(),
                    username: userp,
                    email: req.user.email,
                    role: req.user.role
                });
            }
        })

};


exports.getCreateInterviewpage = async (req, res) => {
    try {
        const lastRec = await Interview.find().sort({ createdAt: -1 }).limit(1);
        const foundRecord = await Unibase.findById(req.body.recordID);

        if (lastRec.length) {
            newId = parseInt(lastRec[0].intId) + 1
        } else {
            newId = 1;
        }

        return res.render('interviews/createInterview', {
            path: '/interviews/dashboard',
            docTitle: 'Create Interview',
            reqID: foundRecord.reqID,
            recordId: foundRecord._id,
            intId: newId,
            marketingPerson: foundRecord.assignedTo,
            vendorCompany: foundRecord.vendorCompany,
            jobTitle: foundRecord.jobTitle,
            primeVendorCompany: foundRecord.primeVendorCompany,
            consultant: foundRecord.appliedFor,
            jobDescription: foundRecord.jobDescription,
            clientName: foundRecord.clientCompany,
            taxType: foundRecord.taxType,
            duration: foundRecord.duration,
            username: req.user.username,
            role: req.user.role
        });

    } catch (error) {
        console.log(error);
    }

}


exports.postInterviewPage = async (req, res) => {

    try {
        req.body.recordOwner = req.user.username;
        const lastRec = await Interview.find().sort({ createdAt: -1 }).limit(1);

        if (lastRec.length) {
            const newId = parseInt(lastRec[0].intId) + 1
            req.body.intId = newId;

        } else {
            const newId = 1;
            req.body.intId = newId;
        }
        if (req.body.interviewWith === "Vendor") {
            req.body.subjectLine = `${req.body.interviewDuration}_${req.body.interviewType}_${req.body.interviewViaMode}_${req.body.meetingType}_Interview_With_Vendor_${req.body.vendorCompany}`;
        }
        if (req.body.interviewWith === "IMP/PV") {
            req.body.subjectLine = `${req.body.interviewDuration}_${req.body.interviewType}_${req.body.interviewViaMode}_${req.body.meetingType}_Interview_With_IMP/PV_${req.body.primeVendorCompany}`;
        }

        if (req.body.interviewWith === "Client") {
            req.body.subjectLine = `${req.body.interviewDuration}_${req.body.interviewType}_${req.body.interviewViaMode}_${req.body.meetingType}_Interview_With_Client_${req.body.clientName}`;
        }

        Interview.create(req.body).then(int => {
            console.log("int", int);
            Unibase.findByIdAndUpdate(int.recordId, { $push: { interviews: { id: int._id, round: int.interviewRound, intId: int.intId } } }, { new: true }).then(rec => {
                console.log("updatedRec", rec)
            });
        });

        return res.redirect('/interviews/confirmed-interviews/1');

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
                    interviewId: foundInt._id,
                    recordId: foundInt.recordId,
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
                    tentativeReason: foundInt.tentativeReason,
                    reqID: foundInt.reqID,
                    recordId: foundInt.recordId,
                    recordOwner: foundInt.recordOwner,
                    updatedBy: foundInt.updatedBy,
                    username: username,
                    role: req.user.role,
                    interviews: foundRecord.interviews,
                    interviewRound: foundInt.interviewRound,
                    interviewViaMode: foundInt.interviewViaMode,
                    interviewWith: foundInt.interviewWith,
                    meetingType: foundInt.meetingType,
                    interviewDuration: foundInt.interviewDuration,
                    timeShift: foundInt.timeShift,
                    timeZone: foundInt.timeZone,
                    remarks: foundInt.remarks || '',
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
                    interviewRound: foundInt.interviewRound,
                    interviewViaMode: foundInt.interviewViaMode,
                    interviewWith: foundInt.interviewWith,
                    meetingType: foundInt.meetingType,
                    interviewDuration: foundInt.interviewDuration,
                    timeShift: foundInt.timeShift,
                    timeZone: foundInt.timeZone,
                    remarks: foundInt.remarks || '',
                    username: username,
                    role: req.user.role,
                });
            }
        });
    });
};

exports.postInterviewUpdatePage = async (req, res) => {
    const intId = req.body.intId;
    const role = req.user.role
    req.body.updatedBy = req.user.username

    if (req.body.interviewWith === "Vendor") {
        req.body.subjectLine = `${req.body.interviewDuration}_${req.body.interviewType}_${req.body.interviewViaMode}_${req.body.meetingType}_Interview_With_Vendor_${req.body.vendorCompany}`;
    }
    if (req.body.interviewWith === "IMP/PV") {
        req.body.subjectLine = `${req.body.interviewDuration}_${req.body.interviewType}_${req.body.interviewViaMode}_${req.body.meetingType}_Interview_With_IMP/PV_${req.body.primeVendorCompany}`;
    }

    if (req.body.interviewWith === "Client") {
        req.body.subjectLine = `${req.body.interviewDuration}_${req.body.interviewType}_${req.body.interviewViaMode}_${req.body.meetingType}_Interview_With_Client_${req.body.clientName}`;
    }

    const record = await Interview.findOne({ intId: intId }).clone();

    await Unibase.findOne({ reqID: record.reqID }, (err, rec) => {
        req.body.clientName = rec.clientCompany;
    }).clone()

    if (role === "Admin" || role === "SuperAdmin") {
        req.body.interviewee = req.body.candidateName;
    } else {
        req.body.interviewee = record.candidateName;
    }

    await Interview.findByIdAndUpdate(record._id, req.body, { new: true });
    return res.redirect('/interviews/view-interviews/' + record.intId);
};


exports.getInterviewDeletePage = async (req, res) => {
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
                role: req.user.role,
                interviewRound: foundInt.interviewRound,
                interviewViaMode: foundInt.interviewViaMode,
                interviewWith: foundInt.interviewWith,
                meetingType: foundInt.meetingType,
                interviewDuration: foundInt.interviewDuration,
                timeShift: foundInt.timeShift,
                timeZone: foundInt.timeZone,
                remarks: foundInt.remarks
            });
        }
    });
};



exports.postInterviewDeletePage = async (req, res) => {
    const intId = req.body.intId;
    await Unibase.findOneAndUpdate({ "interviews": { $elemMatch: { intId: intId } } }, { $pull: { "interviews": { intId: intId } } }, { safe: true, new: true });
    // console.log("recordID", recordId);
    Interview.findOneAndRemove({
        intId: intId
    }, (err) => {
        if (!err) {
            console.log('Interview Deleted Successfully');
        }
    });

    res.redirect('/interviews/confirmed-interviews/1');
};

exports.generateScript = async (req, res) => {
    // ScriptPath = req.path;
    const projects = [];
    try {
        const interview = await Interview.findById(req.body.interviewId);
        const record = await Unibase.findById(req.body.recordId);
        const consultant = await Consultant.findOne({ consultantName: req.body.consultant });
        // console.log("Entered", record);

        for (i = 0; i < consultant.projectName.length; i++) {

            projects.push({
                name: consultant.projectName[i],
                city: consultant.projectCity[i],
                state: consultant.projectState[i],
                startDate: consultant.projectStartDate[i],
                endDate: consultant.projectEndDate[i],
                description: consultant.projectDescription[i]
            });
        }
        res.render('interviews/interview-script', {
            docTitle: "script",
            consultant,
            record,
            interview,
            projects
        });



    } catch (error) {
        console.log(error)
        const interview = await Interview.findById(req.body.interviewId);
        res.redirect('/interviews/view-interviews/' + interview.intId);
    }

}

exports.downloadScriptPdf = async (req, res) => {


    // const newPath = path.join(__dirname,'..','views','interviews/interview-script.ejs');
    // ejs.renderFile(newPath, {}, function(err, str) {

    //     if (err) return console.log(err);

    //     pdf.create(str).toFile("script.pdf", function(err, data) {

    //     if (err) return res.send(err);
    //     console.log("File Created Successfully")
    //     });
    // });
}
