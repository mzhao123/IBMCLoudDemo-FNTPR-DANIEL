# First Nations' Online Reporting Form
By Haoda Fan, Daniel Zhao, Yuting Shen, Ontario Ministry of Health and Long Term Care

# Purpose
The purpose of this application is to demonstrate the capabilities of development on the IBM Cloud (also known as IBM Bluemix).


Its secondary purpose is to be a prototype application for a future project to digitize first nations' spending reports. As many first nations'
The Home and Community Care Branch administers $7.5M to $15M in program allocation funding in order to improve home and community care within 133 First Nations communities across Ontario. These stakeholders are expected to (self) report on spending and program outcomes.  A reporting solution is needed in order to identify how funds are used, to track allocations and to ensure accountability.


This cloud-based form provides another, more efficient way to report income, if implemented properly.


# Application Development information
## Cloud
This project is built for and depoloyed on the **IBM Cloud**, also known as **IBM Bluemix**. The application itself is a **Cloud Foundry Application** built on their **SDK for Node.js**. This application is connected to the **ClearDB Managed MySQL Database** service, also provided by the cloud.   

## Language
The logic of this application is mainly done in Javascript. Tools used:
- Server-side logic: *Node.JS*
- Framework: *ExpressJS*
- User authentication: *Passport*
- Front-end templating engine: *Embedded JavaScript (ejs)*
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
- Email validation upon registration
- Basic funding report form that saves to a database
- A page to view your own report
- The ability to make multiple reports under the same user
- The ability to reset a user's password through email validation
- The ability to delete reports after a confirmation page
- Delete users that have not been validated
### Development features (to be removed in final release):
- Make any query to any database
- Delete all rows from both the user and funding tables
- The fact that it shows your hashed password in your profile (that would be a bit of a security nightmare, I imagine)

### Features to be completed:
- A way to edit the contents of your report

### Possible far-fetched future features:
- Two types of users: first nations' users who create reports, and admin users who moniter them and have advanced priviledges

# Credit where credit is due...
### Thanks to:
- My manager, Sam Shen, for providing me with the guidance and resources needed for this project
- My coworker, Linda Yang, for creating the database structure used in this project
- You, for taking an interest on my project.

:)
