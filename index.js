const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
var session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");
const https = require("https");
const lodash = require("lodash");
const { request } = require("http");
const { header } = require("express/lib/response");
require('dotenv').config();

let apikey = process.env.API_KEY;
const app = express();
app.use(flash());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: 'this is secret',
    // cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const password = encodeURIComponent('kp%HJqwNt2AxEW2');
mongoose.connect('mongodb+srv://Anil:'+password+'@cluster0.yf1qu.mongodb.net/LocationDBase');
const locationDBaseSchema = new mongoose.Schema({
    city: String,
    temp: Number,
    icon: String
});
var LocationDB;

const loginSchema = new mongoose.Schema({
    email: String,
    password: String
});
loginSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",loginSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function geticon(x){
    return "http://openweathermap.org/img/wn/" + x + "@2x.png";
}
app.get("/",function(req,res){
    res.redirect("/city");
});
app.get("/login",function(req,res){
    res.render("login",{message:req.flash('mssg')});
});
app.get("/register",function(req,res){
    res.render("register",{message:req.flash('mssg')});
});
app.get("/logout",function(req,res){
    req.logout(function(err){
        console.log(err);
    });
    res.redirect("/login");
})

app.get("/city",function(req,res){
    res.sendFile(__dirname+ "/public/homepage.html",{key:process.env.API_KEY});
})

app.post("/delete",function(req,res){
    const id = req.body.checkbox;
    LocationDB.findByIdAndDelete(id,function(err,docs){
        if(err){
            console.log(err);
        }else{
            res.redirect("/fav");
        }
    });
});

app.get("/getApikey",(req,res)=>{
    res.header=header
    // if(req.isAuthenticated()){
    //     res.json({key:process.env.API_KEY})
    //     return res
    // }
    //   else{
    //     res.redirect("/login");
    //   }
    res.json({key:process.env.API_KEY})
    return res
})

app.get("/authenticate",function(req,res){
    if(req.isAuthenticated()){
      res.redirect("/fav");
    }
    else{
      res.redirect("/login");
    }
  });

app.post("/register", function(req, res){
    const userdetail = req.body.username;
    User.findOne({username: req.body.username},(err,result)=>{
        if(err){
            console.log(err);
        }else if(result == null){
            User.register({username: req.body.username, active: false}, req.body.password, function(err, user) {
                if(err){
                  console.log(err);
                  res.redirect("/register");
                }
                else{
                  passport.authenticate("local")(req,res,function(){
                      LocationDB = mongoose.model(userdetail,locationDBaseSchema);
                    res.redirect("/authenticate");
                  })
                }
              })
        }else{
            req.flash('mssg',"Existing User");
            res.redirect("/register");
        }
    })
  });
  
  app.post("/login", function(req, res){
    const userdetail = req.body.username;
    const user = new User({
      username : req.body.username,
      password: req.body.password
    });
    
    User.findOne({username: req.body.username},function(err,result){
        if(err){
            console.log(err);
        }else if(result == null){
            req.flash('mssg',"user doesn't exist");
            res.redirect("/login");
        }
        else{
            req.login(user,function(err){
                //   if(err){
                //     console.log(err);
                //   }else{
                    passport.authenticate("local")(req,res,function(){
                        LocationDB = mongoose.model(userdetail,locationDBaseSchema);
                      res.redirect("/authenticate");
                    });
            })
        }
    })

    
  });

app.get("/fav",function(req,res){
    if(req.isAuthenticated()){
        LocationDB.find({},function(err,docs){
            if(err){
                console.log(err);
            }
            else{
                docs.forEach(function(element){
                    https.get("https://api.openweathermap.org/data/2.5/weather?q="+element.city+"&appid="+apikey+"&units=metric",function(response){
                    response.on('data',function(data){
                        const weatherdata = JSON.parse(data);
                        LocationDB.findOneAndUpdate({city:element.city},{temp:Math.floor(weatherdata.main.temp),icon:"http://openweathermap.org/img/wn/"+weatherdata.weather[0].icon+"@2x.png"},function(err){
                            if(err){
                                   console.log(err);
                            }
                        })
                    })
                })
            })   
        }
        res.render('fav',{favLoc:docs,message:req.flash('mssg')});
        })
    }
    else{
        res.redirect("/login")
    }
});

app.post("/fav",function(req,res){
    if(req.body.cityname == ''){
        res.redirect("/fav");
    }
    else{
        LocationDB.findOne({city:lodash.upperFirst(lodash.toLower(req.body.cityname))},function(err,adv){
            if(err){
                console.log(err);
            }else if(adv == null){  
                https.get("https://api.openweathermap.org/data/2.5/weather?q="+req.body.cityname+"&appid="+apikey+"&units=metric",function(response){
                response.on('data',function(data){
                    const weatherdata = JSON.parse(data);
                    const item = new LocationDB({
                        city : lodash.upperFirst(req.body.cityname),
                        temp : Math.floor(weatherdata.main.temp), 
                        icon: "http://openweathermap.org/img/wn/"+weatherdata.weather[0].icon+"@2x.png"
                    })
                item.save();
                })
                res.redirect("/fav");
             })
            }
            else{
                req.flash('mssg',"Already Exists");
                res.redirect("/fav");
            }
        })
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}
app.listen(port,function(){
    console.log("Server started");
});