//jshint esversion:6
//////////////////////DECLARATIONS/////////////////////
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const { ensureAuthenticated } = require('./config/auth');
const requirementController = require('./controllers/reqController');
const interviewController = require('./controllers/interviewController');
const testController = require('./controllers/testController');
const blackListController = require('./controllers/blacklist');
// const consultantDetailsController = require('./controllers/consultant-details');
const consultants = require('./routes/consultant');

//passport config

require('./config/passport')(passport);

const userController = require('./controllers/userController');

app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


//////////////////////
app.use(flash());
app.set('view engine','ejs');
app.use(express.static('public'));

//Global Variables

app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// ===================================================================================


////////////////////GET METHODS - USER AUTHORIZATIONS///////////////////////

app.get('/',userController.getLoginPage);
app.get('/404',userController.get404Page);
app.get('/create-unistack-users',userController.getCreateUserPage);

app.get('/logout',userController.getLogoutPage);

app.get("/reports-dashboard",ensureAuthenticated,requirementController.getDashboard1)

////////////////////GET METHODS -  REQUIREMENT CREATION ///////////////////////
app.get('/requirements/createReq',ensureAuthenticated,requirementController.getCreateReqPage);
app.get('/all-records',ensureAuthenticated,requirementController.getSearchReq); // ADD THIS AS 2ND OPTION "ensureAuthenticated"
app.get('/home', ensureAuthenticated, requirementController.getAllwithPageNumber);
app.get('/requirements/reqlist/:page', ensureAuthenticated, requirementController.getReqList);
app.get("/exportData/:page",ensureAuthenticated,requirementController.exportData );


app.get('/requirements/viewReq/:reqID',ensureAuthenticated,requirementController.getViewRecordPage);
app.get('/requirements/updateReq/:reqID',ensureAuthenticated,requirementController.getUpdateReqPage);
app.get('/requirements/deleteReq/:reqID',ensureAuthenticated,requirementController.getDeletePage);
// ===================================================================================

//////////////////POST REQUEST ///////////////////
app.post('/postCreateReq',ensureAuthenticated,requirementController.postCreatePage);
app.post('/postUpdateReq',ensureAuthenticated,requirementController.postUpdateRecordPage);
app.post('/postDeletePage',ensureAuthenticated,requirementController.postDeletePage);
//////////////////POST REQUEST///////////////////

app.post('/create-unistack-users',userController.postCreateUserPage);
app.post('/login/login',userController.postLoginPage);


// ===================================================================================


//////////////////////////INTERVIEW MODULES - Get Request///////////////////////////////////////////

app.get('/interviews/dashboard/:page',ensureAuthenticated,interviewController.getDashboardPage);
app.get('/interviews/view-interviews/:intId',ensureAuthenticated,interviewController.getInterviewViewPage);
app.get('/interviews/get-interview-details',ensureAuthenticated,interviewController.getInterviewDetailsPage);
app.get('/interviews/update-interview/:intId',ensureAuthenticated,interviewController.getInterviewUpdatePage);
app.get('/interviews/delete-interview/:intId',ensureAuthenticated,interviewController.getInterviewDeletePage);
////////////////////////////////////POST Request/////////////////////////////////////
app.post('/interviews/create-interview',ensureAuthenticated,interviewController.getCreateInterviewpage);
app.post('/interviews/post-create-interview',ensureAuthenticated,interviewController.postInterviewPage);
app.post('/interviews/update-interview',ensureAuthenticated,interviewController.postInterviewUpdatePage);
app.post('/interviews/confirm-delete',ensureAuthenticated,interviewController.postInterviewDeletePage);
////////////////////////////////////////////////////////////////////////////////////
app.get('/interviews/confirmed-interviews/:page',ensureAuthenticated,interviewController.getConfirmedInterviews);
app.get('/interviews/completed-interviews/:page',ensureAuthenticated,interviewController.getCompletedInterviews);
app.get('/interviews/cancelled-interviews/:page',ensureAuthenticated,interviewController.getCancelledInterviews);
app.get('/interviews/tentative-interviews/:page',ensureAuthenticated,interviewController.getTentativeInterviews);
app.get('/interviews/all-interviews',ensureAuthenticated,interviewController.getAllInterviews);
/////////////////////////TEST MODULE/////////////////////////////////////////////////

// ==========================GET REQUESTS================================================

// app.get('/tests/test-dashboard',testController.getTestDashboardPage);
app.get('/tests/get-test-details',ensureAuthenticated,testController.getTestDetailsPage);
app.get('/tests/view-test/:testId',ensureAuthenticated,testController.getTestViewPage);
app.get('/tests/update-test/:testId',ensureAuthenticated,testController.getUpdateTestPage);
app.get('/tests/delete-test/:testId',ensureAuthenticated,testController.getDeleteTestPage);
app.get('/tests/test-dashboard/:page',ensureAuthenticated,testController.getAllTestWithPageNumber);
// =======================================================================================

app.post('/tests/create-test',ensureAuthenticated,testController.getCreateTestpage);
app.post('/tests/post-create-test',ensureAuthenticated,testController.postTestCreatePage);
app.post('/tests/post-update-test',ensureAuthenticated,testController.postTestUpdate);
app.post('/tests/confirm-delete',ensureAuthenticated,testController.postTestDelete);

// =================================================================================
///////////////////////////BlackList Module////////////////////////////

app.get('/blacklist-details/blacklist-home',ensureAuthenticated,blackListController.getBlacklistHome);
app.get('/blacklist-details/client-blacklist-details',ensureAuthenticated,blackListController.getClientBlacklistHome);
app.get('/blacklist-details/prime-vendor-blacklist-details',ensureAuthenticated,blackListController.getPrimeVendorBlacklistHome);
app.get('/blacklist-details/vendor-blacklist-details',ensureAuthenticated,blackListController.getVendorBlacklistHome);

//===================================================================================

//Consultant Routes
app.use('/',consultants);

//=================================================================================

app.get('/login/logs',ensureAuthenticated,userController.getLoginLogs);

//////////////////Setting Server Port///////////////////////////////////////////////

let port = process.env.PORT;
if(port==null || port == ""){
  port = 3000;
}

app.listen(port,function(){
  console.log(`Successfully connected to server port ${port}`);
});

// ===================================================================================