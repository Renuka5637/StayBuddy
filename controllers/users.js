const User = require("../models/user");

module.exports.renderSignupForm = (req,res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        // Automatic login after registration
        req.login(registeredUser, (err) => {
            if (err) return next(err); // handle error
            req.flash("success", "Welcome to StayBuddy!");
            res.redirect("/listings"); 
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req,res) => {
    res.render("users/login.ejs");
}

module.exports.login =  (req, res) => {
        req.flash("success", "Welcome back to StayBuddy!");

        // Use the value from saveRedirectUrl middleware if present,
        // otherwise fall back to a safe default.
        const redirectUrl = res.locals.redirectUrl || "/listings";

        // Clean up the session so the redirect URL isn't reused later.
        delete req.session.redirectUrl;

        res.redirect(redirectUrl);
    }

module.exports.logout = (req,res) => {
    req.logout((err) => {              // req.logout : deserializezs the user. removes req.user and clears the session
        if(err)
        {
            return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    })
}