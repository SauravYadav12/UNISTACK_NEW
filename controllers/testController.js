const mongoose = require('mongoose');
const reqModel = require('../models/unibaseDB');
const userModel = require('../models/userDB');
const interviewModel = require('../models/interviewDB');
const testModel = require('../models/testDB')
const User = mongoose.model('user', userModel.userSchema);
const Unibase = mongoose.model('unibase', reqModel.unibaseSchema);
const Interview = mongoose.model('interview', interviewModel.interviewSchema);
const Test = mongoose.model('test', testModel.testSchema);


exports.getTestDashboardPage = async(req, res) => {

    try {

        let tests = await Test.find();
        res.render('tests/test-dashboard', {
            path: '/tests/test-dashboard',
            docTitle: 'Test Dashboard',
            username: req.user.username,
            test: tests
        });

        
    } catch (error) {
        
        console.log(error);

        res.render('/home', {
            path: '/home',
            docTitle: 'home',
            username: req.user.username,
            error:error
        });
    }

    

};


exports.getAllTestWithPageNumber = (req, res, next) => {

    let perPage = 20
    let page = req.params.page || 1
    let userp = req.user.username
  
    Test
        .find({})
        .sort({"_id":-1})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, records) {
            console.log("Test",records);
            Test.countDocuments().exec(function(err, count) {
                if (err) return next(err)
                res.render('tests/test-dashboard1', {
                  path: "/test-dashboard1",
                  records,
                  email: req.user.email,
                  docTitle: "UniStack || Test",
                  username: userp,
                  current: page,
                  pages: Math.ceil(count / perPage)
                })
            })
        })
  }



exports.getTestDetailsPage = async(req, res) => {

    const records = await Unibase.find({}).sort({_id:-1}).limit(1500);

    res.render('tests/get-test-details1', {
        path: '/tests/test-dashboard',
        docTitle: 'Enter Test Details',
        records:records.reverse(),
        username:req.user.username,
        email: req.user.email,
    });
    // Unibase.find({}, (err, record) => {
    //     if (!err) {
            
    //     }
    // });
};


exports.getCreateTestpage = (req, res) => {
    const username = req.user.username;
    const reqID = req.body.recordID;
    let uniqueRecord = [];
    var testId = 0;

    Test.find().then(data=>{
        for (let i = 0; i < data.length; i++){
            uniqueRecord.push(data[i].testId);
        }
        let newRid = uniqueRecord[uniqueRecord.length - 1]
        testId = parseInt(newRid) + 1

            Unibase.findOne({ reqID: reqID }, (err, foundRecord) => {
                if (!err) {
                    res.render('tests/create-test', {
                        path: '/tests/test-dashboard',
                        docTitle: 'Create Test',
                        reqID: foundRecord.reqID,
                        testId: testId,
                        vendorCompany: foundRecord.vendorCompany,
                        primeVendorCompany: foundRecord.primeVendorCompany,
                        consultant: foundRecord.appliedFor,
                        jobDescription: foundRecord.jobDescription,
                        clientName: foundRecord.clientCompany,
                        taxType: foundRecord.taxType,
                        duration: foundRecord.duration,
                        username: username
                    });
                }
            });
        })
        .catch(err=>console.log(err))

}



exports.postTestCreatePage = (req, res) => {

    const username = req.user.username;
    var uniqueRecord = [];

    Test.find().then(data=>{
        
        for (let i = 0; i < data.length; i++){
            uniqueRecord.push(data[i].testId);
        }
        let newRid = uniqueRecord[uniqueRecord.length - 1]
        req.body.testId = parseInt(newRid) + 1
    
        console.log(req.body.testId);

    const newTest = new Test({
        testId: req.body.testId,
        testEnteredDate: req.body.testEnteredDate,
        testDuration: req.body.testDuration,
        testCompletionDate: req.body.testCompletionDate,
        testStatus: req.body.testStatus,
        consultant: req.body.consultant,
        marketingPerson: req.body.marketingPerson,
        vendorCompany: req.body.vendorCompany,
        primeVendorCompany: req.body.primeVendorCompany,
        gitHubLink: req.body.gitHubLink,
        codeLink: req.body.codeLink,
        result: req.body.result,
        subjectLine: req.body.subjectLine,
        testFocus: req.body.testFocus,
        testDetails: req.body.testDetails,
        jobDescription: req.body.jobDescription,
        testFeedback: req.body.testFeedback,
        taxType: req.body.taxType,
        clientName: req.body.clientName,
        duration: req.body.duration,
        candidateName: req.body.candidateName,
        rateForTest: req.body.rateForTest,
        paymentStatus: req.body.paymentStatus,
        reqID: req.body.reqID,
        recordOwner: username
    });

    newTest.save(err => {
        if (!err) {
            console.log("Test saved successfully");
            res.redirect('/tests/test-dashboard/1');
        } else {
            console.log(err);
        }
    });
})
.catch(err => console.log(err));
}



exports.getTestViewPage = (req, res) => {
    const testId = req.params.testId;
    const username = req.user.username;


    Test.findOne({ testId: testId }, (err, foundTest) => {
        const reqID = foundTest.reqID;

        Unibase.findOne({ reqID: reqID }, (err, foundRecord) => {

            if (!err) {
                res.render('tests/view-test', {
                    path: '/tests/test-dashboard',
                    docTitle: 'View Test',
                    testId: foundTest.testId,
                    testEnteredDate: foundTest.testEnteredDate,
                    testDuration: foundTest.testDuration,
                    testCompletionDate: foundTest.testCompletionDate,
                    testStatus: foundTest.testStatus,
                    consultant: foundTest.consultant,
                    marketingPerson: foundTest.marketingPerson,
                    vendorCompany: foundRecord.vendorCompany,
                    primeVendorCompany: foundRecord.primeVendorCompany,
                    gitHubLink: foundTest.gitHubLink,
                    codeLink: foundTest.codeLink,
                    result: foundTest.result,
                    subjectLine: foundTest.subjectLine,
                    testFocus: foundTest.testFocus,
                    testDetails: foundTest.testDetails,
                    jobDescription: foundRecord.jobDescription,
                    testFeedback: foundTest.testFeedback,
                    taxType: foundRecord.taxType,
                    clientName: foundRecord.clientName,
                    duration: foundRecord.duration,
                    candidateName: foundTest.candidateName,
                    rateForTest: foundTest.rateForTest,
                    paymentStatus: foundTest.paymentStatus,
                    recordOwner: foundTest.recordOwner,
                    reqID: foundTest.reqID,
                    createdAt: foundTest.createdAt,
                    updatedAt: foundTest.updatedAt,
                    updatedBy: foundTest.updatedBy,
                    username: username
                });
            }
        });
    });
};

exports.getUpdateTestPage = (req, res) => {

    const testId = req.params.testId;
    const username = req.user.username;

    Test.findOne({ testId: testId }, (err, foundTest) => {

        const reqID = foundTest.reqID;

        Unibase.findOne({ reqID: reqID }, (err, foundRecord) => {
            if (!err) {
                res.render('tests/update-test', {
                    path: '/tests/test-dashboard',
                    docTitle: 'View Test',
                    testId: foundTest.testId,
                    testEnteredDate: foundTest.testEnteredDate,
                    testDuration: foundTest.testDuration,
                    testCompletionDate: foundTest.testCompletionDate,
                    testStatus: foundTest.testStatus,
                    consultant: foundTest.consultant,
                    marketingPerson: foundTest.marketingPerson,
                    vendorCompany: foundRecord.vendorCompany,
                    primeVendorCompany: foundRecord.primeVendorCompany,
                    gitHubLink: foundTest.gitHubLink,
                    codeLink: foundTest.codeLink,
                    result: foundTest.result,
                    subjectLine: foundTest.subjectLine,
                    testFocus: foundTest.testFocus,
                    testDetails: foundTest.testDetails,
                    jobDescription: foundRecord.jobDescription,
                    testFeedback: foundTest.testFeedback,
                    taxType: foundRecord.taxType,
                    clientName: foundRecord.clientName,
                    duration: foundRecord.duration,
                    candidateName: foundTest.candidateName,
                    rateForTest: foundTest.rateForTest,
                    paymentStatus: foundTest.paymentStatus,
                    recordOwner: foundTest.recordOwner,
                    reqID: foundTest.reqID,
                    createdAt: foundTest.createdAt,
                    updatedAt: foundTest.updatedAt,
                    updatedBy: foundTest.updatedBy,
                    username: username
                });
            }
        });
    });
};

exports.postTestUpdate = (req, res) => {
    const { testId, testEnteredDate, testDuration, testCompletionDate, testStatus, consultant
        , marketingPerson, vendorCompany, primeVendorCompany, gitHubLink, codeLink, result, subjectLine,
        testFocus, testDetails, jobDescription, testFeedback, taxType, clientName, duration, candidateName, rateForTest,
        paymentStatus, reqID } = req.body;

    const username = req.user.username;

    Test.findOneAndUpdate({ testId: testId }, {
        testId: testId,
        testEnteredDate: testEnteredDate,
        testDuration: testDuration,
        testCompletionDate: testCompletionDate,
        testStatus: testStatus,
        consultant: consultant,
        marketingPerson: marketingPerson,
        vendorCompany: vendorCompany,
        primeVendorCompany: primeVendorCompany,
        gitHubLink: gitHubLink,
        codeLink: codeLink,
        result: result,
        subjectLine: subjectLine,
        testFocus: testFocus,
        testDetails: testDetails,
        jobDescription: jobDescription,
        testFeedback: testFeedback,
        taxType: taxType,
        clientName: clientName,
        duration: duration,
        candidateName: candidateName,
        rateForTest: rateForTest,
        paymentStatus: paymentStatus,
        recordOwner: req.body.recordOwner,
        reqID: reqID,
        updatedBy: username

    }, (err, testRecord) => {
        if (!err) {
            testRecord.save();
        } else {
            console.log(err);
        }

        res.redirect('/tests/view-test/' + testId);
    });
};



exports.getDeleteTestPage = (req, res) => {
    const testId = req.params.testId;
    const username = req.user.username;

    Test.findOne({ testId: testId }, (err, foundTest) => {
        const reqID = foundTest.reqID;

        Unibase.findOne({ reqID: reqID }, (err, foundRecord) => {

            if (!err) {
                res.render('tests/delete-test', {
                    path: '/tests/test-dashboard',
                    docTitle: 'Delete Test',
                    testId: foundTest.testId,
                    testEnteredDate: foundTest.testEnteredDate,
                    testDuration: foundTest.testDuration,
                    testCompletionDate: foundTest.testCompletionDate,
                    testStatus: foundTest.testStatus,
                    consultant: foundTest.consultant,
                    marketingPerson: foundTest.marketingPerson,
                    vendorCompany: foundRecord.vendorCompany,
                    primeVendorCompany: foundRecord.primeVendorCompany,
                    gitHubLink: foundTest.gitHubLink,
                    codeLink: foundTest.codeLink,
                    result: foundTest.result,
                    subjectLine: foundTest.subjectLine,
                    testFocus: foundTest.testFocus,
                    testDetails: foundTest.testDetails,
                    jobDescription: foundRecord.jobDescription,
                    testFeedback: foundTest.testFeedback,
                    taxType: foundRecord.taxType,
                    clientName: foundRecord.clientName,
                    duration: foundRecord.duration,
                    candidateName: foundTest.candidateName,
                    rateForTest: foundTest.rateForTest,
                    paymentStatus: foundTest.paymentStatus,
                    recordOwner: foundTest.recordOwner,
                    reqID: foundTest.reqID,
                    createdAt: foundTest.createdAt,
                    updatedAt: foundTest.updatedAt,
                    updatedBy: foundTest.updatedBy,
                    username: username
                });
            }
        });
    });
};


exports.postTestDelete = (req, res) => {
    const testId = req.body.testId;
    Test.findOneAndRemove({ testId: testId }, (err) => {
        if (!err) {
            console.log('Test Deleted Successfully');
        }
    });
    res.redirect('/tests/test-dashboard/1');
};