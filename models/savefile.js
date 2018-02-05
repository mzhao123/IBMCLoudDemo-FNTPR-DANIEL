var fs = require('fs');

module.exports = {
  savefile: function (filename, filedata, callback){
    //if (err) throw err;

    var wstream = fs.createWriteStream(__dirname+ '/'+filename + '.txt');
    wstream.write(filedata + '\n');
    wstream.write('Another line\n');
    wstream.end();

    callback(__dirname + '/'+filename + '.txt');
    /*fs.writeFile('./'+filename+'.txt',"asdfdzxdewwaasd", (err) => {
      if (err) throw err;
      console.log('file saved');
      callback(err, '/'+filename+'.txt');
    });*/
  }
};
