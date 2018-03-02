var query = require('./query.js');
var syncloop = require('./syncloop.js');
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
  displayReport: function(req, callback)
  {
    // This is a several step process:
    // 1. Get data for user profile
    // 2. Get data for basic funding report
    // 3. Get data for the list of funding administration
    // 4. Get data for the list of funding uses

    // 1 - USER PROFILE
    query.newQuery("SELECT * FROM user WHERE user.ID = " + req.user.ID + ";", function(err, dataUser)
    {
      if (err)
      {
        console.log(err);
      }
      else
      {
        // 2 - BASIC FUNDING REPORT
        query.newQuery("SELECT * FROM funding WHERE funding.ID = " + req.query.thisFundingId + ";", function(err, dataFunding)
        {
          if (err)
          {
            console.log(err);
          }
          //This is put in place to ensure the wrong user doesn't have access to someone else's report
          else if (dataFunding[0].UserId != req.user.ID && req.user.admin == 0)
          {
            console.log(dataFunding[0].UserId);
            console.log(req.user.ID);
            console.log(dataFunding[0].UserId != req.user.ID); //If the user's credentials don't match up with the report's user ID credential
            console.log(" ------------------------------------------------- ");
            console.log(" ----- HEY! YOU'RE NOT SUPPOSED TO BE HERE!! ----- ");
            console.log(" ------------------------------------------------- ");
            var blankArray = [];
            callback(blankArray);
          }
          else
          {
            //3 - Funding Administration
            console.log("This funding table id: ");
            console.log(req.query.thisFundingId);
            console.log(dataFunding[0].ID);
            var admin = [false, false, false, false, false];
            query.newQuery("SELECT * FROM funding_administor WHERE FundingID = " + dataFunding[0].ID + " ORDER BY LKPFundingAdministorID;", function(err, dataAdmin)
             {
              if (err)
              {
                console.log(err);
              }
              else
              {
                console.log("dataAdmin: ");
                console.log(dataAdmin);
                console.log("first element: ");
                console.log(dataAdmin[0]);
                console.log("third element: ");
                console.log(dataAdmin[2]); //NOTE THIS WORKS BUT DATAITEM DOES NOT
                var adminComments;
                for (var i = 0; i < dataAdmin.length; i++)
                {
                  admin[(dataAdmin[i].LKPFundingAdministorID - 1)/10] = true;
                  if (dataAdmin[i].LKPFundingAdministorID === 51)
                  {
                    adminComments = dataAdmin[i].Comments;
                  }
                }

                console.log("admin: ");
                console.log(admin);

                //4 - Funding Use
                var use = [false, false, false, false, false, false, false, false, false]
                var comments;
                query.newQuery("SELECT * FROM funding_use WHERE FundingID = " + dataFunding[0].ID + " ORDER BY LKPFundingUseID;", function(err, dataUse)
                {
                  if (err)
                  {
                    console.log(err);
                  }
                  else
                  {
                    for (var i = 0; i < dataUse.length; i++)
                    {
                      use[(dataUse[i].LKPFundingUseID - 1) / 10] = true;
                      if (dataUse[i].LKPFundingUseID === 81)
                      {
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
  },
  // the display report function does not give us adequate data so I am forced to create a new function just to extract two new things : source from homemaking/nurse act and
  //source from the government's first nations and inuit home and community care programs
  //this will be used when editting reports to have certain data already filled out. yay!
  getOtherFundingSources: function(req, callback)
  {
    console.log("HELLO@@@@@");
    query.newQuery("SELECT * FROM funding WHERE funding.ID = " + req.query.thisFundingId + ";", function(err, dataFunding)
    {
      if (err)
      {
        console.log(err);
      }
      //security measure to prevent users from tampering with other users...
      else if((dataFunding[0].UserId != req.user.ID) && req.user.admin == 0)
      {
        console.log(" ----- HEY! YOU'RE NOT SUPPOSED TO BE HERE!! ----- ");
        var blankArray = [];
        callback(blankArray);
      }
      else
      {
        query.newQuery("SELECT SourceFromHomeMaking FROM funding WHERE ID = " + req.query.thisFundingId + "; ", function(err, data)
        {
          console.log("gettingfrom homemaking");
          console.log(data);
          query.newQuery("SELECT SourceFromFirstNation FROM funding WHERE ID = " + req.query.thisFundingId + "; ", function(err, data1)
          {
            var smallArray = [data[0].SourceFromHomeMaking, data1[0].SourceFromFirstNation];
            callback(smallArray);
          });
        });
      }
    });
  },
  adminGetsInfo: function(req, callback)// get all of the user info for an admin
  {
    query.newQuery("SELECT * FROM user WHERE user.ID = " + req.query.userID + ";", function(err, dataUser) //get the user id
    {
      if (err)
      {
        console.log(err);
      }
      else
      {
        query.newQuery("SELECT * FROM funding WHERE funding.ID = " + req.query.thisFundingId + ";", function(err, dataFunding) // get the funding id
        {
          if (err)
          {
            console.log(err);
          }
          else
          {
            var admin = [false, false, false, false, false];
            query.newQuery("SELECT * FROM funding_administor WHERE FundingID = " + dataFunding[0].ID + " ORDER BY LKPFundingAdministorID;", function(err, dataAdmin) //more stuff from database
            {
              if (err)
              {
                console.log(err);
              }
              else
              {
                console.log("dataAdmin: ");
                console.log(dataAdmin);
                console.log("first element: ");
                console.log(dataAdmin[0]);
                console.log("third element: ");
                console.log(dataAdmin[2]); //NOTE THIS WORKS BUT DATAITEM DOES NOT
                var adminComments;
                for (var i = 0; i < dataAdmin.length; i++)
                {
                  admin[(dataAdmin[i].LKPFundingAdministorID - 1)/10] = true;
                  if (dataAdmin[i].LKPFundingAdministorID === 51)
                  {
                    adminComments = dataAdmin[i].Comments;
                  }
                }

                console.log("admin: ");
                console.log(admin);
                //4 - Funding Use
                var use = [false, false, false, false, false, false, false, false, false] //initialize an array to store some funding data
                var comments;
                query.newQuery("SELECT * FROM funding_use WHERE FundingID = " + dataFunding[0].ID + " ORDER BY LKPFundingUseID;", function(err, dataUse)
                {
                  if (err)
                  {
                    console.log(err);
                  }
                  else
                  {
                    for (var i = 0; i < dataUse.length; i++) //for loop that helps us go through each element in an array we obtained from the database (funding help)
                    {
                      use[(dataUse[i].LKPFundingUseID - 1) / 10] = true;
                      if (dataUse[i].LKPFundingUseID === 81)
                      {
                        comments = dataUse[i].Comments;
                      }
                    }
                    console.log("Use: ");
                    console.log(use);

                    var superArray = [dataUser[0], dataFunding[0], admin, adminComments, use, comments]; //assigning the contents of the array
                    callback(superArray);
                  }
                });
              }
            });
          }
        });
      }
    });
  },
  //helper function for array, also allows us to use a callback

  displayAllReports: function(req, array, callback)
  {
    query.newQuery("SELECT * FROM user", function(err, allUsers)
    {
      console.log("are the users being synched?");
      syncloop.synchIt(allUsers.length, function(loop)
      {
        console.log("hello? is the function being opened?");
        query.newQuery("SELECT * FROM funding f WHERE f.UserId = "+allUsers[loop.iteration()].ID+"", function(err, fundingReportForUser)
        {
          if(fundingReportForUser != undefined)
          //goes through each funding table for a single user
          syncloop.synchIt1(fundingReportForUser.length, function(loop1)
          {
            //create array to store data from our first table: Funding_Administor
            var admin = [false, false, false, false, false];
            //more variables to hold our information
            var adminComments;
            query.newQuery("SELECT * FROM funding_administor WHERE FundingID = " + fundingReportForUser[loop1.iteration()].ID + " ORDER BY LKPFundingAdministorID;", function(err, dataAdmin)
            {
              if(err)//error
              {
                console.log("error in funding_administor");
                console.log(err);
              }
              else //we got funding information from one table, so our callback from the function above lets us synchronously access information from the other table
              {
                for (var x = 0; x < dataAdmin.length; x++)
                {
                  admin[(dataAdmin[x].LKPFundingAdministorID - 1)/10] = true; //assign values in array
                  if(dataAdmin[x].LKPFundingAdministorID === 51)
                  {
                    adminComments= dataAdmin[x].Comments;
                  }
                }
              }
            //creates variables to store our data for the table we will query next
            var use = [false, false, false, false, false, false, false, false, false];
            var comments;
              query.newQuery("SELECT * FROM funding_use WHERE FundingID = " + fundingReportForUser[loop1.iteration()].ID + " ORDER BY LKPFundingUseID;", function(err,dataUse)// gathers data from the
              //second table
              {
                if(err)
                {
                  console.log("error in the funding_use table");
                  console.log(err);
                }
                else
                {
                  for(var y =0; y< dataUse.length; y++)
                  {
                    use[(dataUse[y].LKPFundingUseID - 1)/10] = true;//the LKPFundingUseID are multiples of 10 then add 1 i.e. 11, 21, 31, 41.. etc to we can use that to assign the "use"
                    if (dataUse[y].LKPFundingUseID === 81)
                    {
                      comments = dataUse[y].Comments;
                    }
                  }
                  console.log("Use: ");
                  console.log(use);
                  //create and object that will store data to view all the information of the users and then push that object to an array
                  var allUserAndReportInfo =
                  {
                    dataUser: allUsers[loop.iteration()],
                    dataFunding: fundingReportForUser[loop1.iteration()],
                    adminInfo: admin,
                    commentsForAdmin: adminComments,
                    usesForGovFund: use,
                    commentsForUse: comments
                  }
                  console.log("array is pushed!@!@!@!@!@!@!@");
                  console.log(allUserAndReportInfo);
                  array.push(allUserAndReportInfo);
                }
                loop1.next();
              });

            });
          },function()
            {
              loop.next(); //done with inner forloop so callback to iterate the next instance of the outer for loop
            });

        });
    }, function()
        {
        callback();
        });
    });
  }
}
