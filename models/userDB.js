const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://saurav1286:Saurav_1286@cluster0-xmgbj.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true}, function(){
  console.log("Successfully Connected to User Database");
});

// mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true}, function(){
//   console.log("Successfully Connected to User Database");
// });

exports.userSchema = new mongoose.Schema({
    username:{
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
    },
    password:{
      type: String,
      required: true,
    },
    role:{
      type: String,
      default:'user'
    }
});