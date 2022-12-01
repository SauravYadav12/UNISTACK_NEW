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
// const requirementController = require('./controllers/reqController');
const interviewController = require('./controllers/interviewController');
const testController = require('./controllers/testController');
const blackListController = require('./controllers/blacklist');
// const consultantDetailsController = require('./controllers/consultant-details');
const consultants = require('./routes/consultant');
const requirements = require('./routes/requirements');
const interviews = require('./routes/interview');
const tests = require('./routes/test');

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

//requirement Routes
app.use('/',requirements);

//Interview Routes
app.use('/',interviews);

//Test Routes
app.use('/',tests);

//Consultant Routes
app.use('/',consultants);

// ===================================================================================


app.get('/',userController.getLoginPage);
app.get('/404',userController.get404Page);
app.get('/create-unistack-users',userController.getCreateUserPage);
app.post('/create-unistack-users',userController.postCreateUserPage);
app.post('/login/login',userController.postLoginPage);
app.get('/logout',userController.getLogoutPage);
app.get('/login/logs',ensureAuthenticated,userController.getLoginLogs);

// =================================================================================
///////////////////////////BlackList Module////////////////////////////

app.get('/blacklist-details/blacklist-home',ensureAuthenticated,blackListController.getBlacklistHome);
app.get('/blacklist-details/client-blacklist-details',ensureAuthenticated,blackListController.getClientBlacklistHome);
app.get('/blacklist-details/prime-vendor-blacklist-details',ensureAuthenticated,blackListController.getPrimeVendorBlacklistHome);
app.get('/blacklist-details/vendor-blacklist-details',ensureAuthenticated,blackListController.getVendorBlacklistHome);


//////////////////Setting Server Port///////////////////////////////////////////////

let port = process.env.PORT;
if(port==null || port == ""){
  port = 3000;
}

app.listen(port,function(){
  console.log(`Successfully connected to server port ${port}`);
});

// ===================================================================================