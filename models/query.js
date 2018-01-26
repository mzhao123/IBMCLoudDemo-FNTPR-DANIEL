var mysql = require('mysql');
var databasejs = require('../config/database');
//OLD
//var connection = mysql.createConnection(databasejs);

//NEW
var connectionPool = mysql.createPool(databasejs);

module.exports = {
  newQuery: function(query, callback) {
    // THIS NEW FUNCTION SHOULD THEORETICALLY STOP ANY SERVER CLOSED CONNECTION' ERRORS
    connectionPool.getConnection(function(err, connection) {
      if (err) return callback(err);

      console.log("NEW QUERY FUNCTION CALLED.");
      console.log("QUERY: ");
      console.log(query);
      connection.query(query, function(error, data) {
        if (error) {
          connection.release();
          console.error(error);
          callback(error, data);
        }
        else {
          console.log("Query success: " + query);
          console.log(data);
          connection.release();
          callback(error, data);
        }
      });
    });


  }

}
