const mongoose = require("mongoose");
const userModel = require("../models/userDB");
const logModel = require("../models/loginLogs");
const User = mongoose.model("user", userModel.userSchema);
const Logs = mongoose.model("logs", logModel.logsSchema);
const bcrypt = require("bcryptjs");
const passport = require("passport");
const nodemailer = require("nodemailer");

// ================================================
exports.getLoginPage = (req, res) => {
  res.render("login/login", {
    docTitle: "Unistack Login",
  });
};

exports.getCreateUserPage = (req, res) => {
  res.render("create-unistack-users", {
    docTitle: "Create User Admin",
  });
};

exports.get404Page = (req, res) => {
  res.render("404", {
    docTitle: "404 error",
  });
};

exports.getLogoutPage = (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out!");
  res.redirect("/");
};

// =========================================================

exports.postCreateUserPage = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  const email = req.body.email;
  const role = req.body.role

  let errors = [];

  //check required fields
  if (!username || !email || !password || !password2 || !role) {
    errors.push({ msg: "Please fill in all Fields" });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Password do not Match" });
  }

  //Check Password length
  if (password.length < 6) {
    errors.push({ msg: "Password should be of 6 characters" });
  }

  if (errors.length > 0) {
    res.render("create-unistack-users", {
      errors,
      username,
      email,
      password,
      password2,
      role
    });
  } else {
    //If Validation passed
    User.findOne({ email: email }).then((user) => {
      if (user) {
        // If user already exists
        errors.push({ msg: "Email is already registered" });
        res.render("create-unistack-users", {
          errors,
          username,
          email,
          password,
          password2,
          role
        });
      } else {
        const newUser = new User({
          username,
          email,
          password,
          role
        });
        // Hashing the password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //Set password to a Hash
            newUser.password = hash;
            //Save user
            newUser
              .save()
              .then((user) => {
                req.flash("success_msg", "User Created Successfully");
                res.redirect("/");
                console.log("User Created Successfully");
              })
              .catch((err) => console.log(err));
          }),
        );
      }
    });
  }
};

// Login Post

exports.postLoginPage = (req, res, next) => {
  console.log(req.body);

  const login = passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/",
    failureFlash: true,
  })(req, res, next);

  // passport.authenticate('local' ,function(err, user, info) {
    
  //   if (err) { return next(err); }
    
  //   if (!user) { return res.json({status:"fail", message:"No user Found"}); }
    
  //   req.logIn(user, function(err) {
  //       if (err) { return next(err); }
  //       return res.redirect('/home/1')
  //   });
  // })(req, res, next);

  const loginTime = new Date();
  const userEmail = req.body.email;

  if (userEmail == "") {
    login; 
    // return res.status(400).json({status:"fail", message:"Please Enter EmailID"})
  } else {
    User.findOne({ email: userEmail }, (err, userFound) => {
      if (!userFound) {
        login;
        // return res.status(400).json({status:"fail", message:"No user Found"});
      } 
      else {
        const newLog = new Logs({
          username: userFound.username,
          loginTime: loginTime,
        });
        newLog.save((err) => {
          if (!err) {
            console.log("logs saved successfully");
          } else {
            console.log(err);
          }
      });
        //Logic to send emails as notification//
        // var transporter = nodemailer.createTransport({
        //   service: "gmail",
        //   auth: {
        //     user: "unicodersmarketing@gmail.com",
        //     pass: "Unicoders@123",
        //   },
        // });

        // const mailOptions = {
        //   from: userFound.username + "<" + userEmail + ">", 
        //   to: "unicodersmarketing@gmail.com, unicoders.int@gmail.com", 
        //   subject:
        //     "Unibase Login-Notification: " +
        //     userFound.username +
        //     " Logged-In at: " +
        //     loginTime.toLocaleDateString(), 
        //   html:
        //     '<body style="background-color: #fdfdff; margin: 0; padding: 0;font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;"><div style="width: 600px; margin: 5em auto; padding: 2em; background-color: #444447; border-radius: 0.5em; box-shadow: 2px 3px 7px 2px rgba(0,0,0,0.02);"><h1 style="color: white;">Unibase Login Alert</h1> <p style = "color:white;">' +
        //     userFound.username +
        //     " has logged in to Unibase on " +
        //     loginTime.toLocaleDateString() +
        //     " at: " +
        //     loginTime.toLocaleTimeString() +
        //     "</p></div></body>", 
        // };

        // transporter.sendMail(mailOptions, function (err, info) {
        //     if(err)
        //     console.log(err)
        //     else
        //     console.log(info);
        // });

        // login;
      }
    });
  }
};

exports.getLoginLogs = (req, res) => {
  const username = req.user.username;
  Logs.find({}, (err, logs) => {
    if (!err) {
      res.render("login/logs", {
        path: "/login/logs",
        logs: logs,
        docTitle: "Unistack || Logs",
        username: username,
      });
    }
  });
};
