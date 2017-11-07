var mysql = require('mysql');
var databasejs = require('../config/database')
var bcrypt = require('bcrypt-nodejs');

var db = require('./query');

module.exports = {
  generateHash: function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  },

  validPassword: function(email, password, data) {
    //db.newQuery("SELECT password FROM users u WHERE u.email LIKE '" + email + "';", function(err, data) {
      // //data should contain the password
      // console.log("Data: ");
      // console.log(data);
      // console.log(data[0].password);
      // console.log("Your password: " + password);

      var bcryptcomparesync = bcrypt.compareSync(password, data[0].password);
    //   console.log(bcryptcomparesync);
      return bcryptcomparesync;
    // });
  }

}
