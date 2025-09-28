

if(process.env.NODE_ENV != "production"){
  require('dotenv').config();

}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");// ejsmate is used to create common layout for all pages
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL;

main().then(res => {
    console.log("connected to DB");
})
.catch(err => {
    console.log(err);
})


async function main(){
    await mongoose.connect(dbUrl);
}


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);// setting ejsmate as the engine for ejs files
app.use(express.static(path.join(__dirname,"public")));

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24 *3600// time in sec
})

store.on("error", () => {
    console.log("error in mongo session store")
})

const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie: {
        expires:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),// expires 1 week from now
        maxAge: 7 * 24 * 60 * 60 * 1000,// for 1 week only
        httpOnly: true                                //day*hours*minutes*seconds*miliseconds           //Date.now()- gives time in miliseconds
    }
}

// app.get("/",(req,res) => {
//     res.send("hi, i am root");
// });


app.use(session(sessionOptions)); // always include session before routes
app.use(flash());

// passport uses session also

app.use(passport.initialize());// to initialize
app.use(passport.session());// for that particular session
passport.use(new LocalStrategy(User.authenticate()));// to authenticate user by localstrategy

passport.serializeUser(User.serializeUser()); // to store(serialize) info of user once he enters session
passport.deserializeUser(User.deserializeUser()); // to destruct(deserialize) info of user once he exits the session



app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error"); 
    res.locals.currentUser = req.user; //success is an array
    next();
})

// app.get("/demouser", async(req,res) => {
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     })

//    let registeredUser = await User.register(fakeUser,"helloworld");// user(fakeUser),helloworld is password
//    res.send(registeredUser);  
// })



app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all(/.*/, (req, res, next) => {
           next(new ExpressError(404, "Page Not Found"));
      });

//middleware 
app.use((err,req,res,next) => {
    let {statusCode=500,message="Something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
  //  res.status(statusCode).send(message);
});


app.listen(8080,() => {
    console.log("server is listening on port 8080");
})

// fallback route
app.get("*",(req,res) => {
    res.sendFile(path.join(dirname,'views','index.ejs'));
});