const mongoose = require('mongoose');

// mongoose.connect("mongodb+srv://saurav1286:Saurav_1286@cluster0-xmgbj.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true}, function(){
//   console.log("Successfully Connected to Unibase Database");
// });

// mongoose.connect("mongodb://localhost:27017/unibaseDB",{useNewUrlParser:true}, function(){
//   console.log("Successfully Connected to Database");
// });

const unibaseSchema = new mongoose.Schema({
  reqID: {
    type: String,
    unique: true,
  },
  reqStatus:String,
  nextStep: String,
  appliedFor: String,
  assignedTo:String,
  resume: String,
  rate:[],
  taxType:[],
  remote:[],
  duration:[],
  mComment:[{comment:String,created_at:Date,user:String}],
  clientCompany:String,
  clientWebsite: String,
  clientAddress: String,
  clientPerson:String,
  clientPhone: String,
  clientEmail:String,
  primeVendorCompany: String,
  primeVendorWebsite: String,
  primeVendorName: String,
  primeVendorPhone: String,
  primeVendorEmail: String,
  vendorCompany: String,
  vendorWebsite: String,
  vendorPersonName: String,
  vendorPhone: String,
  vendorEmail: String,
  reqEnteredDate: String,
  gotReqFrom: String,
  gotOnResume:String,
  jobTitle: String,
  employementType: String,
  jobPortalLink: String,
  reqEnteredBy: String,
  reqKeywords: String,
  jobDescription: String,
  recordOwner: String,
  primaryTech: String,
  secondaryTech: String,
  updatedBy:String,
  interviews:[],
  primaryTechStack:String,
  isDuplicate:String,
  duplicateWith:String,
}, {
  timestamps:true
});


const Unibase = mongoose.model('Unibase',unibaseSchema);

module.exports = Unibase;