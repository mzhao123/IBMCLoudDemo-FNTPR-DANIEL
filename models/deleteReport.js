var bcrypt = require('bcrypt-nodejs');
var query = require('../models/query');
module.exports = {
  deleteTheReport: function(req, res)
  {
    req.flash('invalid password', 'Invalid Password!');
    if(req.user.ID != req.query.userID && req.user.admin == 0)
    {
      console.log("ERROR YOU MESSED WITH THE QUERY STRING!");
      res.render('deleteError.ejs');
    }
    else
    {
      query.newQuery("SELECT password FROM user WHERE user.ID = '" + req.query.userID + "' ; ", function(err, userPassword)
      {
        if(userPassword.length !=1)
        {
          res.render('deleteReport.ejs',
          { messages: req.flash('invalid password')});
           console.log("WE Have a problem")
           console.log("USER MESSED WITH THE QUERY STRING@@@@@");
         }
         else
         {
           var password;
          if(req.body.passwordProvided == "undefined")
          {
           password = "";
          }
          else
          {
            password= req.body.passwordProvided;
          }
            //security measure, matches userID
           bcrypt.compare(password, userPassword[0].password, function(err, pass)
         {
           if(err)
           {
              console.log("error in functon!");
           }
           if(pass || req.user.admin == 1)
           {
             //callbacks to delete from database the ID mentioned
             console.log("passwords match")
             query.newQuery("SELECT * FROM funding WHERE ID = '" + req.query.fundingID + "';", function (err, theUserID)
             {
               //matches user and funding ID so people cannot just change the query string: redirects back to profile if you do (security) "==" for type conversion
               if(theUserID[0].UserId == req.query.userID)
               {
                 query.newQuery("DELETE FROM funding_administor WHERE FundingID = '" + req.query.fundingID + "'; ", function(err, thingDeleted)
                 {
                   console.log(thingDeleted);
                   query.newQuery("DELETE FROM funding_use WHERE FundingID = '" + req.query.fundingID + "'; ", function (err, theThingDeleted)
                   {
                     console.log(theThingDeleted);
                     query.newQuery("DELETE FROM funding WHERE ID = '" + req.query.fundingID + "' AND UserId = '" + req.query.userID + "' ; ", function(err, reportDeleted)
                     {
                       res.redirect('/profile');
                       console.log("deleted!");
                       console.log(reportDeleted);
                     });
                   });
                 });
               }
               else
               {
                     res.redirect('/profile');
                     console.log("some suspicious activity has occured, or someone just accidentally messed with the query strings!");
               }
             });

           }
           else
           {
            res.render('deleteReport.ejs',
             {   messages: req.flash('invalid password')});
             console.log("passwords don't match");
           };
         });
       }
     });
   }
  }
}
