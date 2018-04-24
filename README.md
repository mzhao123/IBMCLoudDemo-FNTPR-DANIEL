# First Nations' Online Reporting Form
By Haoda Fan, Daniel Zhao, Yuting Shen, Ontario Ministry of Health and Long Term Care

# Purpose
The purpose of this application is to demonstrate the capabilities of development on the IBM Cloud (also known as IBM Bluemix).


Its secondary purpose is to be a prototype application for a future project to digitize first nations' spending reports. The Home and Community Care Branch administers $7.5M to $15M in program allocation funding in order to improve home and community care within 133 First Nations communities across Ontario. These stakeholders are expected to (self) report on spending and program outcomes.  A reporting solution is needed in order to identify how funds are used, to track allocations and to ensure accountability.


This cloud-based form provides another, more efficient way to report income, if implemented properly.


# Application Development information
## Cloud
This project is built for and deployed on the **IBM Cloud**, also known as **IBM Bluemix**. The application itself is a **Cloud Foundry Application** built on their **SDK for Node.js**. This application is connected to the **ClearDB Managed MySQL Database** service, also provided by the cloud.   

## Language
The logic of this application is mainly done in Javascript. Tools used:
- Server-side logic: *Node.JS*
- Framework: *ExpressJS,* *VueJs*
- User authentication: *Passport*
- Front-end templating engine: *Embedded JavaScript (ejs)
- Front-end CSS: *Bootstrap*

## Database
**Database used: ClearDB Managed MySQL Database**
### Database Structure
![Database structure](https://raw.githubusercontent.com/haodafan/IBMCloudDemo-FNTPR/master/diagram2.png "Database Structure")


**Overview of Tables**
- user: contains information about the user (information entered in the sign-up page). Note the password column is missing from this picture.
- funding: contains the user's income report
- funding_use: contains a list of IDs that link to the ways the government funds are used for that user's funding report
- lkp_use_of_funding: contains a list of all possible ways to use funds and their IDs
- funding_administor: contains a list of IDs that list to the ways the user's nation administers their home and community care services
- lkp_administor: contains a list of all possible ways a nation can administer their home and community care services and its respective IDs


Note that an 'auth' table still exists, but it is an obsolete table that is no longer used.


# Current stage of development
### Completed features:
- Simple signup/login/logout
- Email validation upon registration and password reset
- Basic funding report form that saves to a database
- A page to view your own report
- The ability to make multiple reports under the same user
- The ability to delete reports after a confirmation page
- Delete users that have not been validated
- Ability to edit reports already created by the user
- Ability to download reports already created by the user
- Admin accounts with the ability to review, download, and edit reports from other users
### Development features (to be removed in final release):
- Make any query to any database
- Delete all rows from both the user and funding tables
- The fact that it shows your hashed password in your profile (that would be a bit of a security nightmare, I imagine)

### Features to be completed:
- ~~A way to edit the contents of your report~~ **Already Completed**

### Possible far-fetched future features:
- Two types of users: first nations' users who create reports, and admin users who monitor them and have advanced privileges **DONE **

# Current features that users can implement:
### Simple Signup/Login/LOGOUT
Sign up/ login features implemented through passportjs
![Signup](https://raw.githubusercontent.com/mzhao123/IBMCLoudDemo-FNTPR-DANIEL/master/pictures/signup.png )
![Login](https://raw.githubusercontent.com/mzhao123/IBMCLoudDemo-FNTPR-DANIEL/master/pictures/login.png )

### Email Validation
User will be asked to click on link in their email after trying to sign up for an account or resetting their password
![Signup-Validation](https://raw.githubusercontent.com/mzhao123/IBMCLoudDemo-FNTPR-DANIEL/master/pictures/validatesignup.png )
![ResetPass-Validation](https://raw.githubusercontent.com/mzhao123/IBMCLoudDemo-FNTPR-DANIEL/master/pictures/validatechangepass.png )
### Basic Funding Report FORM
The user fills out this form and it is sent to the database
![Form](https://raw.githubusercontent.com/mzhao123/IBMCLoudDemo-FNTPR-DANIEL/master/pictures/reportform.png )

### View, Edit, Delete, and Download reports
As you know, the main goal of the project is to create an efficient solution that will allow First Nation communities to self-report their spending reports. This is done through an online form that a user can fill out. After the form is filled out, the information is sent and saved to the database. When the user visits the profile page, all of the reports filled out can be viewed by clicking buttons that have links to the reports. Once you click a button, you will be able to view the report and also have the option to delete, edit, and download the report. Here are some examples:
#### Profile
![Profile](https://raw.githubusercontent.com/mzhao123/IBMCLoudDemo-FNTPR-DANIEL/master/pictures/profile.png)
#### View-Report
![View Report](https://raw.githubusercontent.com/mzhao123/IBMCLoudDemo-FNTPR-DANIEL/master/viewReportPicture.png)
#### Edit
![Edit](https://raw.githubusercontent.com/mzhao123/IBMCLoudDemo-FNTPR-DANIEL/master/pictures/edit.png)
#### Download (Works but is not ideal)
![Download](https://raw.githubusercontent.com/mzhao123/IBMCLoudDemo-FNTPR-DANIEL/master/pictures/download.png )
#### Delete
![Delete](https://raw.githubusercontent.com/mzhao123/IBMCLoudDemo-FNTPR-DANIEL/master/pictures/delete.png)

# Credit where credit is due...
### Thanks to:
- My manager, Sam Shen, for providing me with the guidance and resources needed for this project
- My coworker, Linda Yang, for creating the database structure used in this project
- You, for taking an interest on my project.

:)
