const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//Load User Model

const User = require('../models/userDB');
// const User = mongoose.model('user',userModel.userSchema);

module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField:'email'}, (email,password,done)=>{
            //Match User
            User.findOne({email:email})
                .then(user=>{
                    if(!user){
                        
                        return done(null, false, {message:'User Not Registered to use the Portal'})
                    }
                    // Match Password
                    bcrypt.compare(password, user.password, (err, isMatch) =>{
                        if(err) throw err;

                        if(isMatch){
                            return done(null,user);
                        } else{
                            return done(null,false, {message:'Incorrect Password'});
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );
    
    passport.serializeUser((user,done)=>{
        done(null,user.id);
    });

    passport.deserializeUser((id,done)=>{
        User.findById(id,(err,user)=>{
            done(err,user);
        });
    });

}