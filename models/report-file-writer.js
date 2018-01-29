var fs = require ('fs');

module.exports = {
  saveReport : function (username, textdata){
    var filename = username + Math.floor((Math.random() * 1000) + 1);
    fs.writeFile('/tmp/' + filename, textdata, function (err){
      if (err){
        throw err;
      }
      else{
        console.log("file saved");
      }
    });
  }
}
