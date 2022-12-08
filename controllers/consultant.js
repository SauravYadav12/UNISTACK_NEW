const mongoose = require('mongoose');
const Unibase = require('../models/unibaseDB');
const User = require('../models/userDB');
const Interview = require('../models/interviewDB');
const Consultant = require('../models/consultant');


exports.getConsultantDetails = async(req,res)=>{

  try {
    const consultants = await Consultant.find().sort({_id:-1});
    const username = req.user.username;
    res.render('consultant/consultant-list',{
        path:'/consultant',
        docTitle:"Consultant List",
        username:username,
        email:req.user.email,
        consultants,
        role: req.user.role,
    });
  } catch (error) {
    
  }
};

exports.getCreateConsultant = (req,res)=>{
    
  res.render('consultant/create-consultant',{
      path: "/consultant",
      docTitle: "UniStack || Reports",
      username: req.user.username,
      email:req.user.email,
      projects: 5,
      role: req.user.role,
    });

};

exports.postCreateConsultant = async(req,res)=>{
  let newId;
  try {
    const lastRec = await Consultant.find().sort({ createdAt: -1 }).limit(1);
    if(lastRec.length){
       newId = parseInt(lastRec[0].consultantId) + 1
    } else {
       newId =  1 ;
    }
    req.body.consultantId = newId;
    req.body.createdBy = req.user.username;

    Consultant.create(req.body).then(()=>{
      res.redirect('/consultant-list');
    });

  } catch (error) {
      console.log(error);
  }
}

exports.getConsultant = async(req,res) => {
  const projects = [];
  console.log(req.path);
  
  try {
    const consultant = await Consultant.findById({_id:req.params.id});
    for(i=0; i < consultant.projectName.length; i++){

      projects.push({name:consultant.projectName[i],
                    city:consultant.projectCity[i],
                    state:consultant.projectState[i],
                    startDate: consultant.projectStartDate[i],
                    endDate: consultant.projectEndDate[i],
                    description: consultant.projectDescription[i]});
    }

    if(req.path.includes('/view-consultant')){
      return res.render('consultant/view-consultant',{
        consultant,
        projects,
        role: req.user.role,
      });
    }else{
      return res.render('consultant/update-consultant',{
        consultant,
        projects,
        role: req.user.role,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

exports.postUpdateConsultant = async(req,res)=>{
  try {
     req.body.updatedBy = req.user.username;
     const consultant = await Consultant.findByIdAndUpdate(req.params.id,req.body,{new:true});
     console.log(consultant);
     return res.redirect(`/view-consultant/${consultant._id}`);
  } catch (error) {
    console.log(error);
  }
}