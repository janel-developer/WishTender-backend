This is the backend for WishTender a wishlist app created for content creators to get gifts safely from fans. 

To get this up and running you will need the environment variables in `.env` that are missing:

```
DEVELOPMENT_DB_DSN
PRODUCTION_DB_DSN
TEST_DB_DSN
THANKYOU_EMAIL
THANKYOU_PASSWORD
CONFIRM_EMAIL
CONFIRM_PASSWORD
TEST_EMAIL
TEST_PASSWORD
STRIPE_SECRET_TEST_KEY
STRIPE_PUBLIC_TEST_KEY
APPFEE
TEST_EXPRESS_ACCOUNT
TEST_EXPRESS_ACCOUNT_CA
```

You can ask me for mine (I'm best reached on twitter [@DashBarkHuss](https://twitter.com/DashBarkHuss)) if you are working on this with me. Or you can setup your own. examples:

```
DEVELOPMENT_DB_DSN= mongodb://127.0.0.1:27017/development (if you set up mongo locally, or go to the mongo atlas site to set up a cluster then get the URI you need to paste here)
PRODUCTION_DB_DSN= mongodb://127.0.0.1:27017/production  
TEST_DB_DSN= mongodb://127.0.0.1:27017/test  
THANKYOU_EMAIL = someemail@zoho.com (I believe it is set up to work with zoho emails so you may need to change somethings if you use a different email hosting. zoho is free)
THANKYOU_PASSWORD = yourzohoemailpassword 
CONFIRM_EMAIL = someemail@zoho.com
CONFIRM_PASSWORD = some password
TEST_EMAIL = hayley16@ethereal.email (you can set up a free etheral email, this helps you test without sending actual emails and getting labeled as spam)
TEST_PASSWORD = the test email password
STRIPE_SECRET_TEST_KEY = get this from stripe
STRIPE_PUBLIC_TEST_KEY= get this from stripe
APPFEE=.10 (this doesn't need to be an environment variable. What was I thinking?)
TEST_EXPRESS_ACCOUNT= a stripe test data connect account id (only necessary for some tests)
TEST_EXPRESS_ACCOUNT_CA = a stripe test data connect account id from canada (only necessary for some tests)
```
