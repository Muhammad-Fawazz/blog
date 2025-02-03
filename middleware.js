const Blog = require("./models/blog");
const ExpressError = require("./utils/error.js");
const { blogSchema } = require("./schema.js");

module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in");
        req.session.redirectUrl = req.originalUrl;
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const myBlog = await Blog.findById(id);
    if (!myBlog.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of the blog");
        return res.redirect(`/blog/${myBlog._id}`);
    }
    next();
}

module.exports.validateBlog = async (req, res, next) => {
    let { error } = blogSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400, msg);
    } else {
        next();
    }
}