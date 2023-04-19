const mongoose = require('mongoose');

// mongoose.connect("mongodb+srv://saurav1286:Saurav_1286@cluster0-xmgbj.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true}, function(){
//   console.log("Successfully Connected to Interview Database");
// });

// mongoose.connect("mongodb://localhost:27017/unibaseDB",{useNewUrlParser:true}, function(){
//   console.log("Successfully Connected to Database");
// });

const interviewSchema = new mongoose.Schema({
  intId : String,
  interviewDate: String,
  interviewTime: String,
  interviewType:String,
  interviewStatus: String,
  consultant: String,
  marketingPerson: String,
  vendorCompany: String,
  primeVendorCompany: String,
  tentativeReason: String,
  gitHubLink: String,
  codeLink: String,
  result: String,
  subjectLine: String,
  interviewMode: String,
  interviewLink: String,
  interviewFocus: String,
  jobDescription: String,
  interviewFeedback: String,
  taxType: String,
  clientName: String,
  duration: String,
  candidateName: String,
  rateForInterview: String,
  paymentStatus:String,
  recordOwner: String,
  reqID:String,
  recordId: String,
  interviewRound:String,
  interviewViaMode: String,
  meetingType:String,
  interviewDuration: String,
  interviewWith:String,
  jobTitle: String,
  timeShift: String,
  timeZone: String,
  updatedBy: String,
  remarks: String,
},{
  timestamps: true
});

const Interview = mongoose.model('Interview',interviewSchema);

module.exports = Interview;