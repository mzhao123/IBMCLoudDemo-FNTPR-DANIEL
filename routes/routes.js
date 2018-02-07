// var express = require('express');
// var router = express.Router();
//
// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });
//
// //module.exports = router;

module.exports = function(app, passport)
{

  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
app.get('/', function(req, res)
{

    res.render('index.ejs');
});
//renders
//DOWNLOAD REPORT NOT SURE IF IT WORKS YET!!!!
app.get('/downloadReport', function (req,res)
{
  //requires
  var path = require('path');
  var fs = require('fs');
  var display = require('../models/displayall.js');
  var ejs = require('ejs');
  var pdf = require('html-pdf');
  //display report  displays the user's selected report based on the query string and the user's data in session
  //(security so user does not modify query string) and returns an array of size 6 that has all of the user's report information
  display.displayReport(req, function(arrayOfSix)
  {
    console.log("HERE IS THE RETURNED ARRAY");
    console.log(arrayOfSix);
    if (arrayOfSix.length === 0)
    {
      res.redirect('/profile');
    }
    else
    {
      console.log(process.cwd());
      ejs.renderFile('/home/vcap/app/views/view-report.ejs',
      {   //render the ejs file into a string so html-pdf can convert, parameters of the ejs file are below (the array of size 6 returned by display report is used)
          user : arrayOfSix[0],
          rep : arrayOfSix[1],
          admin : arrayOfSix[2],
          adminOther : arrayOfSix[3],
          use : arrayOfSix[4],
          useOther: arrayOfSix[5]
      } , function(err, result)
         {
           if(err)
           {
             console.log(err);
             console.log("an error has occured!");
           }
           else
           {
             var html = result;
             //creating the pdf file, sending the file to the .pdf file in views
             pdf.create(html, {border: {"left" : "0.5in", "right" : "0.5in"} } ).toFile('/home/vcap/app/views/viewPDFReport.pdf',
             function(error, success)
             {
               if(error)
               {
                 console.log(error);
                 console.log("error has occured with converting to pdf");
               }
               else
               {
                 console.log("sucess while converting to pdf");
                //finally displaying the pdf file in res
                 res.set('Content-Type: application/pdf')
                 res.sendFile('/home/vcap/app/views/viewPDFReport.pdf');
               }
             });
           }

         });

    }
 });
});
//DELETE FORM
app.get('/deleteReport', function(req, res)
{
  console.log("Just testing to see if the req.user things works!!!!");
  console.log(req.user.ID);
  if(req.user.ID != req.query.userID)
  {
    console.log("ERROR YOU MESSED WITH THE QUERY STRING!");
    res.render('deleteError.ejs');
  }
  res.render('deleteReport.ejs', {messages: 'undefined'});

  });
//CHECKS IF USER PASSWORD MATCHES ID IN QUERY STRING AND THEN DELETES THE REPORT ACCORDING TO THE REPORT ID
app.post('/deleteReport', function(req, res)
{
  console.log("deleting report functionaility activated");
  var deleteReport = require('../models/deleteReport.js');
  deleteReport.deleteTheReport(req, res);

});

app.get('/enter-your-email', function(req, res)
{
  console.log("enter email address initiated")
  res.render('emailResetLink.ejs');
});
//whatever information the user submits into the page will be processed here(resetting by email)
app.post('/emailResetLink', function(req,res)
{
  //declare all the requires
  var query = require('../models/query');
  var loginquery = require('../models/loginquery.js');
  var mail = require('../models/sendMail.js');
  var userEmail = req.body.userEmail;
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
  query.newQuery("SELECT * FROM user WHERE user.Email = '" +   userEmail + "'  ;", function(err, emailLength) {
    if(emailLength.length !=1)
    {
        console.log("email address not found!");
        res.render('invalidEmail.ejs');
    }
    else
    {
      console.log("lets send the user a password reset link!") ;
      //selects the userID with the email entered in by the user
      query.newQuery("SELECT user.ID FROM user WHERE user.Email = '" +   userEmail + "' ;", function(err, queriedID)
      {
        console.log(queriedID);
        //generates token object and then uses it as a parameter in the anonymous function below
        loginquery.generateTokenObject(queriedID, 10, function(tokenObject)
        {
          console.log(tokenObject);
          console.log("@@@@@@@@@");
          console.log(tokenObject.ID[0].ID);
          //inserts the token into the tokens database
          query.newQuery("INSERT INTO token (UserId, TokenContent, Expiry) VALUES (" + tokenObject.ID[0].ID + ", '" + tokenObject.token + "', '" + tokenObject.expiry + "');", function(err, data)
          {
            console.log("SUCCESS!");
            console.log(data);
          });
          console.log("Let's asynchronously also send the email");
          //sends the email message out with the link with the unique token address
          mail.sendFromHaodasMail(userEmail, "First Nations Online Income Reports: Password Reset Link!",
          "Please click on the following link: \n https://demo-fntpr-2.mybluemix.net/forgotten-password?token=" + tokenObject.token + "&ID=RESETPASSWORD to validate yourself: "
          );
       });
      })
//creates a new token for the user so he or she can reset the password

    res.render('linksent.ejs');

    }
  } )
});




  // FORGOT PASSWORD +++++++++++++++++++++++++++++
  //+++++++++++++++++++++++++++++++++++++++++++++
  //+++++++++++++++++++++++++++++++++++++++++++++++

  app.get('/forgotten-password', function(req, res)
  {
    console.log("app reset password starts");
    console.log(req.query.token);
    var query = require('../models/query');
    query.newQuery("SELECT * FROM token WHERE token.TokenContent = '" + req.query.token + "';", function(err, tokenData)
    {
      if (tokenData.length != 1)
      {
        //The user's token does not exist or has expired
        console.log("TOKEN NOT FOUND!");
        res.render('ResetFailure.ejs');
      }
      else
      {
          //check to see if the user's token is still valid or not (expiry date will be used for this)
          var currentDate = new Date();
          console.log("CURRENT TIME: ");
          console.log(currentDate);
          console.log("EXPIRY TIME: ");
          console.log(tokenData[0].Expiry);
          if (currentDate.getTime() > tokenData[0].Expiry)
          {
            console.log("TOKEN EXPIRED!");
            res.render('ResetFailure.ejs', {});
          }
          else
          {
            res.render("forgotpass.ejs" );
          }
      }
        //apparently everything looks good so the program proceeds to reset your password
    })
});
  app.post('/forgotten-password', function(req, res)
  {

    var resetPass = require('../models/resetPassword.js');
    //rests the password
    console.log("password reset starts!");
    resetPass.resetThePassword(req, res);
  });
//  ++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++
  // =====================================
  // LOGIN ===============================
  // =====================================
  app.get('/login', function(req, res)
  {
    console.log("app get '/login'");
    res.render('login.ejs', {message: req.flash('loginMessage')});
  });

  // process the login form
   app.post('/login', passport.authenticate('local-login',
   {
     successRedirect : '/profile',
     failureRedirect : '/login',
     failureFlash : true //allow flash messages
    }));


   // =====================================
   // SIGNUP ==============================
   // =====================================
  app.get('/signup', function(req, res)
  {
    //DEBUGGING
    console.log("app get /signup");
    console.log(req.body);
    console.log("ABOVE IS APP.GET SIGNUP ^^^^^!!!");
    res.render('signup.ejs', {message: req.flash('signupMessage'), message1: req.flash('signupMessage1') });
  });
  // process the signup form
  app.post('/signup', passport.authenticate('local-signup',
  {
      successRedirect : '/validate',
      failureRedirect : '/signup',
      failureFlash : true //allows flash messages
    }));

  app.get('/validate', isLoggedIn, function(req, res)
  {
    console.log("app get /validation-required");
    var query = require('../models/query');
    var loginquery = require('../models/loginquery.js');
    var mail = require('../models/sendMail.js');

    //Now, let's generate a token
    loginquery.generateTokenObject(req.user.ID, 10, function(tokenObject)
    {
      console.log(tokenObject);
      query.newQuery("INSERT INTO token (UserId, TokenContent, Expiry) VALUES (" + tokenObject.ID + ", '" + tokenObject.token + "', '" + tokenObject.expiry + "');", function(err, data)
      {
        console.log("SUCCESS!");
        console.log(data);
      });
      console.log("Let's asynchronously also send the email");
      mail.sendFromHaodasMail(req.user.Email, "First Nations Online Income Reports: User Validation Required!",
        "Please click on the following link: \n https://demo-fntpr-2.mybluemix.net/validate-now?tok=" + tokenObject.token + " to validate yourself: "
      );
    });
    res.render('tobevalidated.ejs');


  });
//CHANES TOKEN STATUS
  // JUST V URSELF
  app.get('/validate-now', function(req, res)
  {
    console.log(req.query.tok);
    var query = require('../models/query');
    var tokenAuthen = require('../models/tokenauth');
    tokenAuthen.checkToken(res, req);
  });

/*

// process another signup form
  app.get('/signup-next', isLoggedIn, function(req, res) {
    //console.log("app get /signup-next");
    //console.log(req.body);
    //console.log("=============================================================");
    //console.log(req.user);
    //console.log("RENDERING NEW PAGE");
    res.render('signup2.ejs', {message: req.flash('signupMessage')});
  });
  app.post('/signup-next', isLoggedIn, function(req, res) {
    //console.log("app post /signup-next");
    //console.log(req.body);
    //console.log("=============================================================");
    //console.log(req.user);
    var make = require('../models/make-report.js');
    make.createUserProfile(req.body, req.user, function() {
      console.log("SUCCESS!");
      res.redirect('/profile');
    });
  });

  */

  // =====================================
  // PROFILE =============================
  // =====================================

  app.get('/profile', isLoggedIn, function(req, res)
  {
    //DEBUGGING
    console.log(req.user);
    var query = require('../models/query.js');
    console.log("/GET PROFILE");
    query.newQuery("SELECT * FROM funding f WHERE f.userId = " + req.user.ID + " ORDER BY ID", function(err, data)
    {
      var isReport;
      if (data.length > 0)
      {
        isReport = true;
      }
      else
      {
        isReport = false;
      }
      for (var i = 0; i < data.length; i++)
      {

        data[i]['link'] = "/view-report" + "?thisFundingId=" + data[i]['ID'];
        console.log("Data[i][link]: ");
        console.log(data[i]['link']);
      }

      //Prove if it's validated...
      var isValidated;
      if (req.user.fnName === 'blank')
      {
        isValidated = false;
      }
      else
      {
        isValidated = true;
      }
      res.render('profile.ejs',
      {
        user : req.user, // get the user out of session and pass to template
        data: data,
        isReport : isReport,
        isValidated: isValidated,
        isAdmin : req.user.Admin
      });


    });

  });

  //
  // Admin Page
  //
  app.get('/admin-view', isLoggedIn, userIsAdmin, function(req, res){
    console.log(req.user.Admin);
    var query = require('../models/query.js');
    query.newQuery("SELECT admin FROM user WHERE ID = " + req.user.Admin + ";", function(err, isAdmin){// a test query
      console.log(isAdmin[0].Admin);
      if (isAdmin[0].Admin != req.user.Admin){
        console.log("Uhhhhhhhh wat?");
        res.redirect('/profile');
      }
      else{
        res.render('admin-view.ejs',
        {
          user : req.user, // get the user out of session and pass to template
          data: [],
          isReport : false,
          isValidated: true,
          isAdmin : req.user.Admin
        });
      }
    });
  });

  app.post('/admin-view', isLoggedIn, userIsAdmin, function(req, res){
    console.log(req.user.Admin);
    var renderOptions = "";
    var query = require('../models/query.js');
    if (req.body.viewall) {
      renderOptions = getProfileRenderOptions(req,"SELECT * FROM funding ORDER BY ID;");
      res.render('admin-view.ejs',renderOptions);
    }
    else {
      var queriedID = "";
      query.newQuery("SELECT ID FROM user WHERE UserName = " + req.body.usernamesearch + " ORDER BY ID", function(err, data)
      {
        queriedID = data[0].ID;
        renderOptions = getProfileRenderOptions(req,"SELECT * FROM funding f WHERE f.userId = " + queriedID + " ORDER BY ID;");
        res.render('admin-view.ejs',renderOptions);
      });
    }
  });

  // =====================================
  // NEW FORM ============================
  // =====================================
  app.get('/make-report', isLoggedIn, function(req, res)
  {
    console.log("/make-report get route function INVOKED");
    console.log("Let's make a new report.");
    res.render('form.ejs', {user: req.user});
  });

  app.post('/make-report', isLoggedIn, function(req, res)
  {
    console.log("/make-report post route function INVOKED");
    var make = require('../models/make-report.js');

    console.log("Pass in this variable: ");
    console.log(req.body);
    console.log("Pass in this variable as well: ");
    console.log(req.user);
    make.createReport(req.body, req.user, function()
    {
      console.log("SUCCESS!");
      res.redirect('/profile');
    });
  });
  // =====================================
  // VIEW FORM ===========================
  // =====================================
  app.get('/view-report', isLoggedIn, function(req, res)
  {
    console.log("get /view-report");
    // TBH THIS COULD PROBABLY BE ITS OWN MODULE BUT FOR NOW I'LL LEAVE IT HERE
    //var display = require('../models/displayall.js');
    var display = require('../models/displayall.js');

    display.displayReport(req, function(arrayOfSix)
    {
      console.log("HERE IS THE RETURNED ARRAY");
      console.log(arrayOfSix);
      if (arrayOfSix.length === 0)
      {
        res.redirect('/profile');
      }
      else {
        res.render('view-report.ejs',
        {
          user : arrayOfSix[0],
          rep : arrayOfSix[1],
          admin : arrayOfSix[2],
          adminOther : arrayOfSix[3],
          use : arrayOfSix[4],
          useOther: arrayOfSix[5]
        });
      }
    });
  });


  app.get('/save-report', isLoggedIn, function(req, res)
  {
    console.log("get /save-report");

    var display = require('../models/displayall.js');
    var savefile = require('../models/savefile.js');
    savefile.savefile(req.query.userID+'testreport', "glhf", function(fileref){
      res.download(fileref);
    });

    /*display.displayReport(req, function(arrayOfSix)
    {
      console.log("HERE IS THE RETURNED ARRAY");
      console.log(arrayOfSix);
      if (arrayOfSix.length === 0)
      {
        res.redirect('/profile');
      }
      else {
        res.render('view-report.ejs',
        {
          user : arrayOfSix[0],
          rep : arrayOfSix[1],
          admin : arrayOfSix[2],
          adminOther : arrayOfSix[3],
          use : arrayOfSix[4],
          useOther: arrayOfSix[5]
        });
      }
    });*/
  });



  app.get('/editReportPasswordConfirmation', isLoggedIn, function(req, res)
  {
    //checks to see if the userid in query matches with the userid in session
    if(req.user.ID != req.query.userID)
    {
      console.log("ERROR YOU MESSED WITH THE QUERY STRING!");
      res.render('deleteError.ejs');
    }
      var display = require('../models/displayall.js');
      console.log("get edit report");
      //retrieving necessary info
    display.getOtherFundingSources(req, function(otherFunding)
    { console.log("get edit report1");
      display.displayReport(req, function(arrayOfSix)
      {
        console.log("get edit report2");
        //if nothing, redirect to homepage, shouldn't happen though
        if (arrayOfSix.length === 0)
        {
          res.redirect('/profile');
        }
        else
        {
          console.log("getting the edit report page");
          res.render('editReportPasswordConf.ejs',
          {
            messages: "undefined",
            user : arrayOfSix[0],
            rep : arrayOfSix[1],
            admin : arrayOfSix[2],
            adminOther : arrayOfSix[3],
            use : arrayOfSix[4],
            useOther: arrayOfSix[5],
            SourceFromHomeMaking: otherFunding[0],
            SourceFromFirstNation: otherFunding[1]
          });
        }
      });
    });
  });
  app.post('/editReportPasswordConfirmation', isLoggedIn, function(req, res)
  {
    //just some security precautions
    if(req.user.ID != req.query.userID)
    {
      console.log("ERROR YOU MESSED WITH THE QUERY STRING!");
      res.render('deleteError.ejs');
    }
    //IRON MAN BTW I STAND ALONE...
    req.flash('invalid password', 'Invalid Password!');
    var display = require('../models/displayall.js');
    var bcrypt = require('bcrypt-nodejs');
    var query = require('../models/query');
    //getting password from database
    query.newQuery("SELECT password FROM user WHERE user.ID = '" + req.query.userID + "' ; ", function(err, userPassword)
    {
      if(userPassword.length !=1)
      {
        console.log("user messed with query string or user does not exist in database anymore");
        res.redirect('/profile');
      }
      else
      {
        //comparing the password entered on the form and the user's password
         bcrypt.compare(req.body.passwordconfirm, userPassword[0].password, function(err, pass)
         {
           if(err)
           {
             console.log("error in the compare password function!")
           }
           //works!
           if(pass)
           {
             var make = require('../models/make-report.js');
             console.log("passwords match!");
             make.editReport(req.query.thisFundingId, req.body, req.user, function()
             {
               console.log("report updated!");
               res.redirect('/profile');
             });
           }
           //entered invalid password
          else
          {
            display.getOtherFundingSources(req, function(otherFunding)
            {
              display.displayReport(req, function(arrayOfSix)
              {
                if (arrayOfSix.length === 0)
                {
                  res.redirect('/profile');
                }
                else
                {
                  //renders all of the data in the report along with the invalid password message
                  res.render('editReportPasswordConf.ejs',
                  {
                    messages: req.flash('invalid password'),
                    user : arrayOfSix[0],
                    rep : arrayOfSix[1],
                    admin : arrayOfSix[2],
                    adminOther : arrayOfSix[3],
                    use : arrayOfSix[4],
                    useOther: arrayOfSix[5],
                    SourceFromHomeMaking: otherFunding[0],
                    SourceFromFirstNation: otherFunding[1]
                  });
                }
                console.log("WE Have a problem")
                console.log("USER MESSED WITH THE QUERY STRING@@@@@ or user just entered invalid password...lol");
              });
            });
           }
         });
       }
    });
  });




  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res)
  {
      req.logout();
      res.redirect('/');
  });







  // ======================================
  // DEBUGGING ROUTES =====================
  // ======================================
  app.get('/make-query', function(req, res)
  {
    res.render('querydatabase.ejs', {data: "no data", prev: 'SELECT * FROM user;'});
  });
  app.post('/make-query', function(req, res)
  {
    console.log("/make-query post route function INVOKER");

    /*
    console.log("FIRST LETS MAKE SURE THE TEXTAREA WORKS");
    console.log(req.body.userQuery);

    strQuery = JSON.stringify(req.body.userQuery);

    res.render('querydatabase.ejs', {data: strQuery});

     */
    var query = require('../models/query');
    console.log(req.body.userQuery);
    query.newQuery(req.body.userQuery, function(err, result)
    {
      if (err)
      {
        console.log(err);
      }
      strResult = JSON.stringify(result);
      res.render('querydatabase.ejs', {data: strResult, prev: req.body.userQuery});
    });

  });


  app.get('/test', function(req, res)
  {
    //COMMENT OUT AFTER DEBUGGING TABLES
    res.render('test.ejs', {data: "no data"});
  });

  app.post('/test', function(req, res)
  {
    console.log("/test post route function INVOKED");
    //console.log(" =========================================== --- REQ --- =========================================== ");
    //console.log(req);
    //console.log(" =========================================== --- RES --- =========================================== ");
    //console.log(res);
    var displayAll = require('../models/displayall');
    displayAll.returnTable(req.body.table, function(result)
    {
      res.render('test.ejs', {data: result});
    });
  });

  app.get('/test-email', function(req, res)
  {
    console.log("/test-email GET function invoked");
    res.render('test-email.ejs', {data : "Click the Send Mail button to... well,  send the mail. Ya dip."});
  });

  app.post('/test-email', function(req, res)
  {
    console.log("/test-email POST function invoked");
    console.log("BODY: ");
    console.log(req.body);

    var mail = require('../models/sendMail.js');
    mail.sendFromHaodasMail(req.body.sendEmail, req.body.sendSubject, req.body.sendContent, function ()
    {
      console.log("EMAIL SENT.");
      res.render('test-email.ejs', {data: "Email message sent! Check your inbox!"});
    });
  });

    //THIS IS FOR DEBUGGING PURPOSES
    //COMMENT OUT IN FINAL DEMO
    /*
    */
    app.get('/delete-all-data-from-table-user', function(req, res)
    {
      var query = require('../models/query.js');
      query.newQuery("DELETE FROM user", function(req, res)
      {
        if (err)
        {
          console.log(err);
        }
        else
        {
          console.log("DELETED.");
          res.redirect('/');
        }
      });
    });
    app.get('/delete-all-data-from-table-funding', function(req, res)
    {
      var query = require('../models/query.js');
      query.newQuery("DELETE FROM funding", function(req, res)
      {
        console.log("DELETED.");
        res.redirect('/');
      });
    });
    // DEBUGGING

    app.get('/purge', function(req, res)
    {
      console.log("I-I-It's the Purge, Morty! We're in The Purge!!");

      //This will delete all expired tokens and unvalidated users without valid tokens!
      var darkLogin = require('../models/loginquery.js');
      darkLogin.purgeTokens(function ()
      {
        console.log("The tokens have been purged!");
        darkLogin.purgeAccounts(function ()
        {
          console.log("The users have been purged!");
          res.redirect('/');
        });
      });
    });

};



//other functions
function isLoggedIn(req, res, next)
{

  // if the user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

function userIsAdmin(req, res, next){
  if (req.user.Admin) return next();
  res.redirect('/');
}

//helper
function getProfileRenderOptions(req, sqlquery){
  var query = require('../models/query.js');
  query.newQuery(sqlquery, function(err, data)
  {
    var isReport;
    if (data.length > 0)
    {
      isReport = true;
    }
    else
    {
      isReport = false;
    }
    for (var i = 0; i < data.length; i++)
    {
      data[i]['link'] = "/view-report" + "?thisFundingId=" + data[i]['ID'];
      console.log("Data[i][link]: ");
      console.log(data[i]['link']);
    }
    return{
      user : req.user, // get the user out of session and pass to template
      data: data,
      isReport : isReport,
      isValidated: true,
      isAdmin : req.user.Admin
    };
  });
}
