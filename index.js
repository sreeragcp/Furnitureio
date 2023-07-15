require('dotenv').config()
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGOURL);
const config = {
  sessionSecret: process.env.SESSION_SECRET,
};
const bodyParser=require('body-parser')
const hbs = require("hbs");
const path = require('path')
const express = require("express");
const app = express();
const Handlebars = require('handlebars')
const multer = require("multer")
const session = require("express-session");
const Razorpay=require('razorpay');

RAZORPAY_KEY_ID="rzp_test_BpSJANNcT49vSc"
RAZORPAY_KEY_SECRET="iLoNeVfdYXJutthBV6ihAZvI"
var instance = new Razorpay({
  key_id:"rzp_test_BpSJANNcT49vSc",
  key_secret:"iLoNeVfdYXJutthBV6ihAZvI"
});

//session
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false
}));


/// helper function/////
hbs.registerHelper('addOne', function(index) {
  return index + 1;
});

hbs.registerHelper('neq', function(a,b){
  return a!==b;
}); 

hbs.registerHelper('lte', function(a, b) {
  return  a>=b;
});


hbs.registerHelper('eq', function (a, b) {
  return a === b;
});

hbs.registerHelper('or', function (a, b) {
  return a  ||  b;
});

hbs.registerHelper('and', function (a, b) {
  return a && b;
});

hbs.registerHelper('subtract', function (a, b) {
  return a - b;
});


hbs.registerHelper('add', function (a, b) {
  return a + b;
});

hbs.registerHelper('mul', function (a, b) {
  return a * b;
});




app.use(function (req, res, next) {
    res.header('Cache-Control', 'no-cache, no-store');
   next();
  });

  app.set('view engine','hbs');

app.use(express.static(path.join(__dirname,"public")))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//express.js//express.url


hbs.registerPartials(path.join(__dirname, '/views/layouts'))


//for user route

const userRoute = require('./routes/userRoute');
app.use('/', userRoute);

//for admin route

const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);


// app.set('views','./views/users');

//hbs partials

app.use(async function (req, res, next) {
  res.status(404).render("users/404");
});

app.listen(3000,function(){
    console.log("server is running...on http://localhost:3000/");
});