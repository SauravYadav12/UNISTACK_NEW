const mongoose = require('mongoose');


const consultant = new mongoose.Schema({
    consultantId:{
        type: Number
    },
    consultantName: {
        type: String,
    },
    visaStatus: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    zipcode: {
        type: Number
    },
    dob: {
        type: Date,
    },
    ssn: {
        type: String,
    },
    dlNo: {
        type: String,
    },
    degree: {
        type: String,
    },
    university: {
        type: String,
    },
    yearPassing: {
        type: String,
    },
    timeZone: {
        type: String,
    },
    projectName:{
        type:[String],
    },
    projectCity:{
        type:[String],
    },
    projectState:{
        type:[String],
    },
    projectStartDate:{
        type:[String],
    },
    projectEndDate:{
        type:[String],
    },
    projectDescription:{
        type:[String],
    },
    createdBy: {
        type: String,
    },
    updatedBy: {
        type: String,
    },
  },
  {
    timestamps: true
  });


  const Consultant = mongoose.model('Consultant',consultant);

  module.exports = Consultant;


