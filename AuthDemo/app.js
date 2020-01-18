const express = require('express'),
        flash = require('connect-flash'),
        user = require('./models/user'),
        mongoose = require('mongoose'),
        passport = require('passport'),
        bodyparser = require('body-parser'),
        localStrategy = require('passport-local'),
        passportLocalmongoose = require('passport-local-mongoose'),
 app = express()
 port = 3000
app.set("view engine", "ejs")
app.use(bodyparser.urlencoded({extended: true}))
app.use(require('express-session')({
    secret: "Auth",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
passport.serializeUser(user.serializeUser())
passport.deserializeUser(user.deserializeUser())
passport.use(new localStrategy(user.authenticate()))

mongoose.connect("mongodb://localhost:27017/AuthDemo")

//  ************    ROUTES  **********************// 
app.get('/', (req, res) => res.render('home'))
app.get('/welcome',isLoggedIn,(req,res)=> res.render('welcome'))

// **************   AUTH ROUTES //

// ****************  SIGN UP //
app.get('/register',(req,res)=>res.render('register'))
app.post('/register',(req,res)=>{
    user.register(new user({username: req.body.username}),req.body.password,(err,user)=>{
        if (err)   {
            res.render('errorpage',{err:err})
        } 
        else{
            passport.authenticate('local')(req,res,function(){
                res.redirect('/welcome',{user: user})
            })
        }
    })
})
// ******************* LOGIN //
app.get('/login',(req,res)=> res.render('login'))
app.post('/login',passport.authenticate('local',{
    successRedirect: '/welcome',
    failureRedirect: '/login' 
}),(req,res)=>{})

// *********************** LOGOUT //
app.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/')
})

// ******************* Middleware // 
function isLoggedIn(req,res,next) { 
    if (req.isAuthenticated()){
        return next()
    }
    return res.redirect('/login')
 }

app.listen(port, () => console.log(`AuthDemo listening on port ${port}!`))