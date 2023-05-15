if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}



const express = require('express')
const app = express();
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const helmet=require("helmet")

const flash = require('connect-flash')

const mongoSanitise=require('express-mongo-sanitize')

const campgroundRouter = require('./routes/campground')
const reviewRouter = require('./routes/review')
const userRouter = require('./routes/user');
const MongoStore = require("connect-mongo");
// const dbURL=process.env.DB_URL
const dbUrl=process.env.DB_URL||'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl)
    .then(() => {
        console.log('Database Connected')
    })
    .catch(() => {
        console.log('connection failed')
    })

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

secret=process.env.SECRE||'thisshouldbeabettersecret'

  const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
        secret
    
});


store.on("error",function(e){
    console.log("Session store error",e)
})

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(mongoSanitise())
app.use(session(sessionConfig))
app.use(flash())
// app.use(helmet())






const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/animesh98/",
];
const styleSrcUrls = [
    "https://api.mapbox.com/mapbox-gl-js/v2.7.0/mapbox-gl.css",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/animesh98/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://res.cloudinary.com/animesh98/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/animesh98/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.query)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
}
)

app.use('/campgrounds', campgroundRouter)
app.use('/campgrounds/:id/reviews', reviewRouter)
app.use('/', userRouter)
app.get('/fakeuser', async (req, res) => {
    const user = new User({ email: 'animesh@gmail.com', username: 'fake' })
    const newuser = await User.register(user, 'fake')
    res.send(newuser)
})

app.get('/', (req, res) => {
    res.render('home')

})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { statuscode = 500 } = err;

    if (!err.message) err.message = 'Oh no Something Went Wrong'
    res.status(statuscode).render('error', { err })
})

const port=process.env.PORT||3000;

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})