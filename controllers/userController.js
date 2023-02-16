const mongoose = require("mongoose");
const User = require("../models/userDB");
const Logs = require("../models/loginLogs");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const nodemailer = require("nodemailer");

// ================================================
exports.getLoginPage = (req, res) => {
  res.render("login/login", {
    docTitle: "Unistack Login",
    status: undefined,
    message: undefined
  });
};

exports.getCreateUserPage = (req, res) => {
  res.render("create-unistack-users", {
    docTitle: "Create User Admin",
    message: "Page Loaded Successfully"
  });
};

exports.get404Page = (req, res) => {
  res.render("404", {
    docTitle: "404 error",
  });
};

exports.getLogoutPage = (req, res) => {
  req.logout(()=>{
    console.log("logging out");
    req.flash("success_msg", "You are logged out!");
    res.redirect("/");
  });
  
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
  
  passport.authenticate('local',{
      successRedirect: '/home',
      failureRedirect: '/',
      failureFlash: true
  })(req,res,next);
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
