const mongoose = require('mongoose');

// mongoose.connect("mongodb+srv://saurav1286:Saurav_1286@cluster0-xmgbj.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true}, function(){
//   console.log("Successfully Connected to logs Database");
// });

// mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true}, function(){
//   console.log("Successfully Connected to User Database");
// });

const logsSchema = new mongoose.Schema({
    username:{
      type: String,
      required: true
    },
    loginTime: {
      type: Date,
      required: true,
    }
});

const Logs = mongoose.model('Logs',logsSchema);

module.exports = Logs;