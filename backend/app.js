const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./connection/database");
const authRoutes = require("./PassportRoutes/UserRoutes");
const messageRouter = require("./PassportRoutes/MessageRoutes");
const crypto = require("crypto");


dotenv.config();
const app = express();

app.get("/", (req, res) => {
  res.send("Backend is running!");
});
// ✅ Configure CORS properly
const corsOptions = {
    origin: "https://real-time-chatapp-frontend-saze.onrender.com/", // frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "token"],
    credentials: true
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/user", authRoutes);
app.use("/message", messageRouter);


// Create HTTP and socket server
const server = http.createServer(app);
const { setupSocket } = require("./socket");
setupSocket(server);

// Connect DB and start server
connectDB();
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// passport
const passport = require("passport");
const google = require("passport-google-oauth20").Strategy;
const session = require("express-session");

app.use(session({
    secret:"secret",
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize());   // to initialize passport.js
app.use(passport.session())


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
        done(null, user);
});

const User = require("./Schema/Userschema"); // import your User model
const jwt = require("jsonwebtoken");

passport.use(new google({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://real-time-chatapp-frontend-saze.onrender.com/auth/google/callback",
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const picture = profile.photos[0].value || "";

        let user = await User.findOne({ email });

        if (!user) {
            // Create a new user in DB for first-time login
            user = await User.create({
                email,
                name,
                profilePic: picture,
                password: crypto.randomBytes(20).toString("hex"), // leave blank or generate a random hash
                isGoogleUser: true // add this flag in schema if needed
            });
        }

        return done(null, user); // pass full user to callback
    } catch (err) {
        return done(err, null);
    }
}));

app.get('/auth/google',
    passport.authenticate('google', {
            scope:
                ['email', 'profile'],
            session: false
        }
    ));
app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/',
        session: false
    }),
    function (req, res) {
        console.log("req.user:", req.user); 
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
    console.log("Generated token:", token);
    res.redirect(`https://real-time-chatapp-frontend-saze.onrender.com/?token=${token}`);
}
);






// Error: Login sessions require session support. Did you forget to use `express-session` middleware?
//     at SessionManager.logIn (C:\Users\heman\Downloads\chattingapp\backend\node_modules\passport\lib\sessionmanager.js:21:33)
//     at req.login.req.logIn (C:\Users\heman\Downloads\chattingapp\backend\node_modules\passport\lib\http\request.js:39:26)
//     at strategy.success (C:\Users\heman\Downloads\chattingapp\backend\node_modules\passport\lib\middleware\authenticate.js:265:13)
//     at verified (C:\Users\heman\Downloads\chattingapp\backend\node_modules\passport-oauth2\lib\strategy.js:189:20)
//     at Strategy._verify (C:\Users\heman\Downloads\chattingapp\backend\app.js:182:16)
//     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
// so used express-session
