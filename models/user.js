// models/user.js

//Import foreign goods =========================================================
var mongoose = require('mysql');
var bcrypt = require('bcrypt-nodejs');

//define the schema for our user model

var userSchema = mongoose.Schema({
  local : {
    email : String,
    password : String
  }
});


// HELPER FUNCTIONS ============================================================
// #HASH GENERATION
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//Password Check
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

//Create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
