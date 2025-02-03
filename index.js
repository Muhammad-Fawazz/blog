const express = require("express");
const app = express();
const path = require('path');
const engine = require('ejs-mate');
const mongoose = require("mongoose");
const Blog = require("./models/blog");
const methodOverride = require("method-override");
const port = 8080;
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/error.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const flash = require("connect-flash");
const { isLoggedin, saveRedirectUrl, isOwner, validateBlog } = require("./middleware.js");
require('dotenv').config();

app.use(express.static("public"));
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

const dbURL = process.env.ATLASDB_URL;

app.listen(port, () => {
    console.log("app is running on port", port);
});

mongoose.connect(dbURL)
    .then(() => console.log("Connected!"))
    .catch((err) => {
        console.error("Database connection failed!", err);
    });

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    next();
});

const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600,
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.redirect("/blog");
});

app.get('/blog', wrapAsync(async (req, res) => {
    const blogs = await Blog.find({})
    res.render('blog/index', { blogs });
}));

app.get('/blog/new', isLoggedin, (req, res) => {
    res.render('blog/new');
});

app.get('/blog/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const myBlog = await Blog.findById(id).populate("owner");

    if (!myBlog) {
        req.flash("error", "Blog does not exist for that path");
        res.redirect("/blog");
    }
    console.log(myBlog);
    res.render('blog/show', { myBlog });
}));

app.post("/blog", isLoggedin, validateBlog, wrapAsync(async (req, res) => {
    const { blog } = req.body;
    const newBlog = new Blog(blog);
    newBlog.owner = req.user._id;
    await newBlog.save();
    req.flash("success", "New Blog Created!");
    res.redirect(`/blog/${newBlog._id}`);
}));

app.get('/blog/:id/edit', isLoggedin, wrapAsync(async (req, res) => {
    const { id } = req.params;

    const myBlog = await Blog.findById(id);
    if (!myBlog) {
        req.flash("error", "Blog does not exist for that path");
        res.redirect("/blog");
    }

    res.render('blog/edit', { myBlog });
}));

app.put("/blog/:id",
    isLoggedin,
    isOwner,
    validateBlog,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const { blog } = req.body;
        const updatedBlog = await Blog.findByIdAndUpdate(id, { ...blog });
        req.flash("success", "Blog Updated!");
        res.redirect(`/blog/${updatedBlog._id}`);
    })
);

app.delete("/blog/:id", isLoggedin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    console.log(id);
    await Blog.findByIdAndDelete(id);
    req.flash("success", "Blog Deleted!");
    res.redirect("/blog");
}));

app.get("/signup", (req, res) => {
    res.render("users/signup");
});

app.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Signed Up Successfully!");
            res.redirect("/blog");

        })

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));

app.get("/login", (req, res) => {
    res.render("users/login");
});

app.post("/login", saveRedirectUrl, passport.authenticate("local", {
    failureRedirect: false,
    failureFlash: true,
}),
    async (req, res) => {
        req.flash("success", "Logged in Successfully!");
        let redirectUrl = res.locals.redirectUrl || "/blog";
        res.redirect(redirectUrl);
    });

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }
        req.flash("success", "Logged out Successfully!");
        res.redirect("/blog");
    })
})

app.all("*", (req, res, next) => {
    next(new ExpressError(400, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});
