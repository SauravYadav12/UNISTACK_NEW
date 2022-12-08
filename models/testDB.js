const mongoose = require('mongoose');

// mongoose.connect("mongodb+srv://saurav1286:Saurav_1286@cluster0-xmgbj.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true}, function(){
//   console.log("Successfully Connected to Test Database");
// });

// mongoose.connect("mongodb://localhost:27017/unibaseDB",{useNewUrlParser:true}, function(){
//   console.log("Successfully Connected to Database");
// });

const testSchema = new mongoose.Schema({
  testId : String,
  testEnteredDate: String,
  testDuration: String,
  testCompletionDate:String,
  testStatus: String,
  consultant: String,
  marketingPerson: String,
  vendorCompany: String,
  primeVendorCompany: String,
  gitHubLink: String,
  codeLink: String,
  result: String,
  subjectLine: String,
  testFocus: String,
  testDetails: String,
  jobDescription: String,
  testFeedback: String,
  taxType: String,
  clientName: String,
  duration: String,
  candidateName:String,
  rateForTest: String,
  paymentStatus:String,
  recordOwner: String,
  reqID:String,
  updatedBy: String
},{
  timestamps: true
});

const Test = mongoose.model('Test',testSchema);

module.exports = Test;