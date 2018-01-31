var query = require('./query.js');
var schema = "ibmx_7c3d0b86c1998ef";
module.exports = {
  returnTable: function(tableName, callback) {
    query.newQuery("SELECT * FROM " + schema + "." + tableName + ";", function(err, data) {
      if (err) {
        console.log(err);
      }
      else {
        console.log(data);

        var strData = JSON.stringify(data);

        return callback(strData);
      }
    });
  },
  // THIS FUNCTION RETURNS A CALLBACK WITH ALL THE REQUIRED INFORMATION IN AN ARRAY
  displayReport: function(req, callback) {
    // This is a several step process:
    // 1. Get data for user profile
    // 2. Get data for basic funding report
    // 3. Get data for the list of funding administration
    // 4. Get data for the list of funding uses

    // 1 - USER PROFILE
    query.newQuery("SELECT * FROM user WHERE user.ID = " + req.user.ID + ";", function(err, dataUser) {
      if (err) {
        console.log(err);
      }
      else {
        // 2 - BASIC FUNDING REPORT
        query.newQuery("SELECT * FROM funding WHERE funding.ID = " + req.query.thisFundingId + ";", function(err, dataFunding) {
          if (err) {
            console.log(err);
          }
          //This is put in place to ensure the wrong user doesn't have access to someone else's report
          else if (dataFunding[0].UserId != req.user.ID) {
            console.log(dataFunding[0].UserId);
            console.log(req.user.ID);
            console.log(dataFunding[0].UserId != req.user.ID); //If the user's credentials don't match up with the report's user ID credential
            console.log(" ------------------------------------------------- ");
            console.log(" ----- HEY! YOU'RE NOT SUPPOSED TO BE HERE!! ----- ");
            console.log(" ------------------------------------------------- ");
            var blankArray = [];
            callback(blankArray);
          }
          else {
            //3 - Funding Administration
            console.log("This funding table id: ");
            console.log(req.query.thisFundingId);
            console.log(dataFunding[0].ID);
            var admin = [false, false, false, false, false];
            query.newQuery("SELECT * FROM funding_administor WHERE FundingID = " + dataFunding[0].ID + " ORDER BY LKPFundingAdministorID;", function(err, dataAdmin) {
              if (err) {
                console.log(err);
              }
              else {
                console.log("dataAdmin: ");
                console.log(dataAdmin);
                console.log("first element: ");
                console.log(dataAdmin[0]);
                console.log("third element: ");
                console.log(dataAdmin[2]); //NOTE THIS WORKS BUT DATAITEM DOES NOT
                var adminComments;
                for (var i = 0; i < dataAdmin.length; i++) {
                  admin[(dataAdmin[i].LKPFundingAdministorID - 1)/10] = true;
                  if (dataAdmin[i].LKPFundingAdministorID === 51) {
                    adminComments = dataAdmin[i].Comments;
                  }
                }

                console.log("admin: ");
                console.log(admin);

                //4 - Funding Use
                var use = [false, false, false, false, false, false, false, false, false]
                var comments;
                query.newQuery("SELECT * FROM funding_use WHERE FundingID = " + dataFunding[0].ID + " ORDER BY LKPFundingUseID;", function(err, dataUse) {
                  if (err) {
                    console.log(err);
                  }
                  else {
                    for (var i = 0; i < dataUse.length; i++) {
                      use[(dataUse[i].LKPFundingUseID - 1) / 10] = true;
                      if (dataUse[i].LKPFundingUseID === 81) {
                        comments = dataUse[i].Comments;
                      }
                    }
                    console.log("Use: ");
                    console.log(use);

                    var superArray = [dataUser[0], dataFunding[0], admin, adminComments, use, comments];
                    callback(superArray);
                  }
                });
              }
            });

          }
        });
      }
    });
  }
}
