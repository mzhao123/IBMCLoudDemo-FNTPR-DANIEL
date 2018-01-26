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
//renders the enter-your-email page
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
          "Please click on the following link: \n https://demo-fntpr-2.mybluemix.net/forgotten-password?token=" + tokenObject.token + " to validate yourself: "
          );
       });
      })
//creates a new token for the user so he or she can reset the password

    res.render('linksent.ejs');

    }
  } )
}
)






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

    var query = require('../models/query'); //needed exports
    var loginquery = require('../models/loginquery.js'); //needed exports

    var userInfo = req.body;

    console.log(userInfo.password1);
    console.log(userInfo.password2);
    console.log(req.query.token);
    if(userInfo.password1 == userInfo.password2)
    {

      query.newQuery("SELECT * FROM token WHERE token.TokenContent = '" + req.query.token + "';", function(err, tokenData)
      { console.log("yoooo!");
        loginquery.generateResetHash(userInfo.password1, function (hashedPassword)
        {
          console.log("hello?");
          query.newQuery("UPDATE user SET password = '" + hashedPassword + "' WHERE ID = " + tokenData[0].UserId + ";", function(err, data)  //query the database to change the password
          {
              console.log("password changed?");
              if(err)
              {
                console.log(err);
              }
              else
              {
                //Second, let's get rid of the useless token
                  query.newQuery("DELETE FROM token WHERE TokenContent = '" + tokenData[0].TokenContent + "';", function(err, data)
                  {
                    if (err)
                    {
                      console.log(err);
                    }
                    else
                    {
                      console.log("JUST CHECKING TO SEE IF TOKEN LINK REDIRECTS TO LOGIN");
                    }
                 });
              }
          }       );
        } );   //encrpt the password...for security reasons...and then pass the return result into a callback


        //successfully changed the password so you are redirected to another page
        res.render("passwordchanged.ejs");
      })

    }
    else
    {
      console.log("passwords didn't match")
    }

  });
//  ++++++++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++
  // =====================================
  // LOGIN ===============================
  // =====================================
  app.get('/login', function(req, res) {
    console.log("app get '/login'");
    res.render('login.ejs', {message: req.flash('loginMessage')});
  });

  // process the login form
   app.post('/login', passport.authenticate('local-login', {
     successRedirect : '/profile',
     failureRedirect : '/login',
     failureFlash : true //allow flash messages
    }));


   // =====================================
   // SIGNUP ==============================
   // =====================================
  app.get('/signup', function(req, res) {
    //DEBUGGING
    console.log("app get /signup");
    console.log(req.body);
    res.render('signup.ejs', {message: req.flash('signupMessage')});
  });
  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
      successRedirect : '/validate',
      failureRedirect : '/signup',
      failureFlash : true //allows flash messages
    }));

  app.get('/validate', isLoggedIn, function(req, res) {


    console.log("app get /validation-required");
    var query = require('../models/query');
    var loginquery = require('../models/loginquery.js');
    var mail = require('../models/sendMail.js');

    //Now, let's generate a token
    loginquery.generateTokenObject(req.user.ID, 10, function(tokenObject) {
      console.log(tokenObject);
      query.newQuery("INSERT INTO token (UserId, TokenContent, Expiry) VALUES (" + tokenObject.ID + ", '" + tokenObject.token + "', '" + tokenObject.expiry + "');", function(err, data) {
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
  app.get('/validate-now', function(req, res) {
    console.log(req.query.tok);
    var query = require('../models/query');
    query.newQuery("SELECT * FROM token WHERE token.TokenContent = '" + req.query.tok + "';", function(err, tokenData) {
      //First, check if it exists
      if (tokenData.length != 1) {
        //The user's token does not exist or has expired
        console.log("TOKEN NOT FOUND!");
        res.render('validationFailure.ejs', {});
      }
      else {
        //Now, we check if this token is still valid...
        var currentDate = new Date();
        console.log("CURRENT TIME: ");
        console.log(currentDate);
        console.log("EXPIRY TIME: ");
        console.log(tokenData[0].Expiry);
        if (currentDate.getTime() > tokenData[0].Expiry) {
          console.log("TOKEN EXPIRED!");
          res.render('validationFailure.ejs', {});
        }
        else {
          //EVERYTHING IS VALIDATED!
          //First, let's update the valid column for this user
          query.newQuery("UPDATE user SET validated = 1 WHERE ID = " + tokenData[0].UserId + ";", function(err, data) {
            if(err) {
              console.log(err);
            }
            else {
              //Second, let's get rid of the useless token
              query.newQuery("DELETE FROM token WHERE TokenContent = '" + tokenData[0].TokenContent + "';", function(err, data) {
                if (err) {
                  console.log(err);
                }
                else {
                  console.log("JUST CHECKING TO SEE IF TOKEN LINK REDIRECTS TO LOGIN");
                  res.redirect('/login');
                }
              });

            }
          });
        }
      }
    });
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

  app.get('/profile', isLoggedIn, function(req, res) {
    //DEBUGGING
    console.log(req.user);
    var query = require('../models/query.js');
    console.log("/GET PROFILE");
    query.newQuery("SELECT * FROM funding f WHERE f.userId = " + req.user.ID + " ORDER BY ID", function(err, data) {
      var isReport;
      if (data.length > 0) {
        isReport = true;
      }
      else {
        isReport = false;
      }
      for (var i = 0; i < data.length; i++) {
        data[i]['link'] = "/view-report" + "?thisFundingId=" + data[i]['ID'];
        console.log("Data[i][link]: ");
        console.log(data[i]['link']);
      }

      //Prove if it's validated...
      var isValidated;
      if (req.user.fnName === 'blank') {
        isValidated = false;
      }
      else {
        isValidated = true;
      }
      res.render('profile.ejs', {
        user : req.user, // get the user out of session and pass to template
        data: data,
        isReport : isReport,
        isValidated: isValidated
      });
    })

  });

  // =====================================
  // NEW FORM ============================
  // =====================================
  app.get('/make-report', isLoggedIn, function(req, res) {
    console.log("/make-report get route function INVOKED");
    console.log("Let's make a new report.");
    res.render('form.ejs', {user: req.user});
  });

  app.post('/make-report', isLoggedIn, function(req, res) {
    console.log("/make-report post route function INVOKED");
    var make = require('../models/make-report.js');

    console.log("Pass in this variable: ");
    console.log(req.body);
    console.log("Pass in this variable as well: ");
    console.log(req.user);
    make.createReport(req.body, req.user, function() {
      console.log("SUCCESS!");
      res.redirect('/profile');
    });
  });
  // =====================================
  // VIEW FORM ===========================
  // =====================================
  app.get('/view-report', isLoggedIn, function(req, res) {
    console.log("get /view-report")
    // TBH THIS COULD PROBABLY BE ITS OWN MODULE BUT FOR NOW I'LL LEAVE IT HERE
    //var display = require('../models/displayall.js');
    var display = require('../models/displayall.js');

    display.displayReport(req, function(arrayOfSix) {
      console.log("HERE IS THE RETURNED ARRAY");
      console.log(arrayOfSix);
      if (arrayOfSix.length === 0) {
        res.redirect('/profile');
      }
      else {
        res.render('view-report.ejs', {
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


  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });







  // ======================================
  // DEBUGGING ROUTES =====================
  // ======================================
  app.get('/make-query', function(req, res) {
    res.render('querydatabase.ejs', {data: "no data"});
  });
  app.post('/make-query', function(req, res) {
    console.log("/make-query post route function INVOKER");

    /*
    console.log("FIRST LETS MAKE SURE THE TEXTAREA WORKS");
    console.log(req.body.userQuery);

    strQuery = JSON.stringify(req.body.userQuery);

    res.render('querydatabase.ejs', {data: strQuery});

     */
    var query = require('../models/query');
    console.log(req.body.userQuery);
    query.newQuery(req.body.userQuery, function(err, result) {
      if (err) {
        console.log(err);
      }
      strResult = JSON.stringify(result);
      res.render('querydatabase.ejs', {data: strResult});
    });

  });


  app.get('/test', function(req, res) {
    //COMMENT OUT AFTER DEBUGGING TABLES
    res.render('test.ejs', {data: "no data"});
  });

  app.post('/test', function(req, res) {
    console.log("/test post route function INVOKED");
    //console.log(" =========================================== --- REQ --- =========================================== ");
    //console.log(req);
    //console.log(" =========================================== --- RES --- =========================================== ");
    //console.log(res);
    var displayAll = require('../models/displayall');
    displayAll.returnTable(req.body.table, function(result) {
      res.render('test.ejs', {data: result})
    });
  });

  app.get('/test-email', function(req, res) {
    console.log("/test-email GET function invoked");
    res.render('test-email.ejs', {data : "Click the Send Mail button to... well,  send the mail. Ya dip."});
  });

  app.post('/test-email', function(req, res) {
    console.log("/test-email POST function invoked");
    console.log("BODY: ");
    console.log(req.body)

    var mail = require('../models/sendMail.js');
    mail.sendFromHaodasMail(req.body.sendEmail, req.body.sendSubject, req.body.sendContent, function () {
      console.log("EMAIL SENT.");
      res.render('test-email.ejs', {data: "Email message sent! Check your inbox!"});
    });
  });

    //THIS IS FOR DEBUGGING PURPOSES
    //COMMENT OUT IN FINAL DEMO
    /*
    */
    app.get('/delete-all-data-from-table-user', function(req, res) {
      var query = require('../models/query.js');
      query.newQuery("DELETE FROM user", function(req, res) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("DELETED.");
          res.redirect('/');
        }
      });
    });
    app.get('/delete-all-data-from-table-funding', function(req, res) {
      var query = require('../models/query.js');
      query.newQuery("DELETE FROM funding", function(req, res) {
        console.log("DELETED.");
        res.redirect('/');
      });
    });
    // DEBUGGING

    app.get('/purge', function(req, res) {
      console.log("I-I-It's the Purge, Morty! We're in The Purge!!");

      //This will delete all expired tokens and unvalidated users without valid tokens!
      var darkLogin = require('../models/loginquery.js');
      darkLogin.purgeTokens(function () {
        console.log("The tokens have been purged!");
        darkLogin.purgeAccounts(function () {
          console.log("The users have been purged!");
          res.redirect('/');
        });
      });
    });

};

function isLoggedIn(req, res, next) {

  // if the user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}
