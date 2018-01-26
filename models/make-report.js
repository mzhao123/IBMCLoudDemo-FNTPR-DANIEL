var query = require('./query.js');
var schema = "ibmx_7c3d0b86c1998ef"
module.exports = {
  returnTable: function(tableName, callback) {
    query.newQuery("SELECT * FROM " + schema + "." + tableName + ";", function(err, data) {
      if (err) {
        //if there is an error from the query
        console.log(err);
      }
      else {
        console.log(data);
        return callback(data);
      }
    });
  },

  createReport: function(reqBody, reqUser, callback) {
    //This will take SEVERAL queries to fill out every table.
    console.log("CREATE REPORT CALLED.");
     //Query 2: funding
     /*
      * Year
      * FundingProvided
      * FundingSpent
      * SourceFromHomeMaking
      * SourceFromFirstNation
      * NumberOfClientServed
      * HomeCarePriorities
      * Comments
      * Approved
      * SubmitDate
      */

     // SOME BOOLEAN => TINYINT CONVERSION
     var queryFunding;
     var sourcefromhome = "0";
     var sourcefromgov = "0";
     var approved = "0";
     if (reqBody.fundNursing === "on") {
       sourcefromhome = "1";
     }
     if (reqBody.fundGov === "on") {
       sourcefromgov = "1";
     }
     if (reqBody.approval ===  "on") {
       approved = "1";
     }

     var editedPriorities = reqBody.priorities.replace(/"/g, '&quot;');
     editedPriorities = editedPriorities.replace(/'/g, '&rsquo;');

     var editedComments = reqBody.comments.replace(/"/g, '&quot;');
     editedComments = editedComments.replace(/'/g, '&rsquo;');
     queryFunding = "INSERT INTO funding (userID, Year, FundingProvided, FundingSpent, SourceFromHomeMaking, SourceFromFirstNation, NumberOfClientServed, HomeCarePriorities, Comments, Approved, SubmitDate) VALUES "
     + "(" + reqUser.ID + ", 2017, " + reqBody.fundProvided + ", " + reqBody.fundSpent + ", " + sourcefromhome
     + ", " + sourcefromgov + ", " + reqBody.numClients + ", '" + editedPriorities + "', '" + editedComments
     + "', " + approved + ", NOW());";

     //NOT TOO SURE WHAT TO PUT IN ANY OF THE OTHER TABLES T B H

     //Now insert them all!

     //FIRST QUERY!
     /*
     query.newQuery(queryUser, function(err, data) {
       console.log("USER QUERY STARTED!");
       if (err) {
         console.log(err);
       }
       else {
         console.log("DATA: ");
         console.log(data);
         doneUser = true;
         */
         //SECOND QUERY!
         query.newQuery(queryFunding, function(err, data)
         {
           console.log("FUNDING QUERY STARTED!")
           if (err)
           {
             console.log(err);
           }
           else
           {
             console.log("DATA 2: ");
             console.log(data);

             //Now we deal with USE OF FUNDING tables and ADMINISTRATOR tables.
             // A D M I N   T A B L E
             checkAndInsert("funding_administor", "adminDirect", reqBody.adminDirect, data.insertId)
              .then(function(){checkAndInsert("funding_administor", "adminThirdParty", reqBody.adminThirdParty, data.insertId)})
                .then(function(){checkAndInsert("funding_administor", "adminCouncil", reqBody.adminCouncil, data.insertId)})
                  .then(function(){checkAndInsert("funding_administor", "adminLHIN", reqBody.adminLHIN, data.insertId)})
                    .then(function(){checkAndInsert("funding_administor", "adminOther", reqBody.adminOther, data.insertId)})
                      .then(function(){checkAndInsert("funding_administor", "adminSpecify", reqBody.adminSpecify, data.insertId)})
                        //USE TABLE
                        .then(function(){checkAndInsert("funding_use", "useDirectFirstNations", reqBody.useDirectFirstNations, data.insertId)})
                          .then(function(){checkAndInsert("funding_use", "useDirectOther", reqBody.useDirectOther, data.insertId)})
                            .then(function(){checkAndInsert("funding_use", "useTraining", reqBody.useTraining, data.insertId)})
                              .then(function(){checkAndInsert("funding_use", "useAdmin", reqBody.useAdmin, data.insertId)})
                                .then(function(){checkAndInsert("funding_use", "useRecruit", reqBody.useRecruit, data.insertId)})
                                  .then(function(){checkAndInsert("funding_use", "useSupplies", reqBody.useSupplies, data.insertId)})
                                    .then(function(){checkAndInsert("funding_use", "useOfficeSupplies", reqBody.useOfficeSupplies, data.insertId)})
                                      .then(function(){checkAndInsert("funding_use", "useTravel", reqBody.useTravel, data.insertId)})
                                        .then(function(){checkAndInsert("funding_use", "useOther", reqBody.useOther, data.insertId)})
                                        //No more callback hell tyvm Daniel
                                        callback();
           }
         });
      // }
    //});
  },
  createUserProfile: function(reqBody, reqUser, callback)
  {
    console.log("CREATE USER PROFILE CALLED.");
      //Query 1: user
      /*
       * UserName [x]
       * FirstNationName
       * ChiefName
       * ContactName
       * PhoneNO
       * Email
       * CreateDate
       * Password [x]
       */
       /*
       var now = new Date();
       var queryUser;
       queryUser = "INSERT INTO user (UserName, FirstNationName, ChiefName, ContactName, PhoneNO, Email, CreateDate) "
                 + " VALUES ('" + reqBody.userName + "', '" + reqBody.fnName + "', '" + reqBody.chiefName + "', '"
                 + reqBody.contactName + "', " + reqBody.contactPhone + ", '" + reqBody.contactEmail
                 + "', NOW());";
      */
      var queryUser;
      queryUser = "UPDATE user SET FirstNationName = '" + reqBody.fnName + "', ChiefName = '" + reqBody.chiefName + "', "
                  + "ContactName = '" + reqBody.contactName + "', " + "PhoneNO = '" + reqBody.contactPhone + "' "
                  + " WHERE UserName = '" + reqUser.UserName + "';"; //UNFINISHED

      query.newQuery(queryUser, function(err, data)
      {
        console.log("USER QUERY UPDATE STARTED.");
        if (err)
        {
          console.log(err);
        }
        else
        {
          console.log("DATA: ");
          console.log(data);
          callback();
        }
      });
  }
}

/*
 * This function is meant for the tables that reference the LOOKUP tables.
 */
 function checkAndInsert(table, fieldName, field, fundingID)
 {
 	if (field === "on" || fieldName === "useOther" || fieldName === "adminSpecify")
 	{
 	  console.log("CHECK AND INSERT FUNCTION CALLED.");
 	  if (table === "funding_administor")
 	  {
 		query.newQuery("SELECT ID FROM lkp_administor l WHERE l.Administor = '" + fieldName + "';", function(err, data1)
 		{
 			if (err)
 			{
 				throw err;
 			}
 			console.log(data1);
 			var insertQuery;
 			if (fieldName === "adminSpecify")
 			{
 			    editedField = field.replace(/'/g, '&rsquo;');
 			    insertQuery = "INSERT INTO funding_administor (FundingID, LKPFundingAdministorID, Comments) VALUES (" + fundingID + ", " + data1[0].ID + ", '" + editedField + "');";
 			}
 			else
 			{
 				var insertQuery = "INSERT INTO funding_administor (FundingID, LKPFundingAdministorID) VALUES (" + fundingID + ", " + data1[0].ID + ");";
 			}
 			query.newQuery(insertQuery, function(err, data2)
 			{
 				console.log("INSERT SUCCESS.");
 				console.log(data2);
 			});
 	   });

    }
 	    else if (table === "funding_use")
 	   {
 			query.newQuery("SELECT ID FROM lkp_use_of_funding l WHERE l.UseOfFunding = '" + fieldName + "';", function(err, data1)
 			{
 				if (err)
 				{
 					throw err;
 				}
 				console.log(data1);
 				var insertQuery;
 				//If it's the 'other'
 				if (fieldName === "useOther")
 				{
 					editedField = field.replace(/'/g, '&rsquo;');
 					insertQuery = "INSERT INTO funding_use (FundingID, LKPFundingUseID, Comments) VALUES (" + fundingID + ", " + data1[0].ID + ", '" + editedField + "');";
 				}
 				else
 				{
 					insertQuery = "INSERT INTO funding_use (FundingID, LKPFundingUseID) VALUES (" + fundingID + ", " + data1[0].ID + ");";
 				}
 				query.newQuery(insertQuery, function(err, data2)
        {
 				     console.log("INSERT SUCCESS.");
 				     console.log(data2);
 				});
 			});
    }

 	}
 	else
 	{
 		console.log("Nothing Happens.");
 	}
    return new Promise(function (resolve, reject)
    {
      resolve();
    });
 }
