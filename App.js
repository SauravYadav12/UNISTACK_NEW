//jshint esversion:6
//////////////////////DECLARATIONS/////////////////////
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { ensureAuthenticated } = require("./config/auth");
const mongoose = require("mongoose");
const consultants = require("./routes/consultant");
const requirements = require("./routes/requirements");
const interviews = require("./routes/interview");
const tests = require("./routes/test");
const reports = require("./routes/reports");
const teams = require("./routes/interviewTeams");
const morgan = require("morgan");
const cors = require("cors");
//passport config

require("./config/passport")(passport);

const userController = require("./controllers/userController");

// app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  morgan("combined", {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
  })
);

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

//Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//////////////////////
app.set("view engine", "ejs");
app.use(express.static("public"));

const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

//Database Setup
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose.set("strictQuery", false);
mongoose
  .connect(DB)
  .then(() => console.log("DB Connections successfull"))
  .catch((err) => console.log("Could not establish database connection", err));

// ===================================================================================

//requirement Routes
app.use("/", requirements);

//Interview Routes
app.use("/", interviews);

//Test Routes
app.use("/", tests);

//Consultant Routes
app.use("/", consultants);

//reports
app.use("/reports", reports);

//InterviewTeams
app.use("/", teams);

// ===================================================================================

app.get("/", userController.getLoginPage);
app.get("/404", userController.get404Page);
app.get("/create-unistack-users", userController.getCreateUserPage);
app.post("/create-unistack-users", userController.postCreateUserPage);
app.post("/login", userController.postLoginPage);
app.get("/logout", userController.getLogoutPage);
app.get("/login/logs", ensureAuthenticated, userController.getLoginLogs);

//////////////////Setting Server Port///////////////////////////////////////////////

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log(`Successfully connected to server port ${port}`);
});

// ===================================================================================
