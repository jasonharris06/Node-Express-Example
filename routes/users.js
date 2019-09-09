const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs")
const { check, validationResult, body } = require('express-validator');
const passport = require("passport");



//Bring in Models
let User = require("../models/user");

// Register Form
router.get("/register", function (req, res) {
    res.render("register");
})

//register process
router.post('/register', [
    check("name", "Name Field is Required").isLength({ min: 1 }),
    check("email", "Please Enter an Email Address").isEmail(),
    check("username", "Username is Required").isLength({ min: 1 }),
    check("password", "Password is Required").isLength({ min: 1 })

]
    , body('password2').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }

        // Indicates the success of this synchronous custom validator
        return true;
    }),
    function (req, res) {
        //
        const name = req.body.name;
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const password2 = req.body.password2;
        //error handling
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('register', {
                title: "Register",
                errors: errors
            })
        } else {
            let newUser = new User({
                name,
                email,
                username,
                password
            });
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(newUser.password, salt, function (err, hash) {
                    if (err) {
                        console.log(err);
                    }
                    newUser.password = hash;
                    newUser.save(function (err) {
                        if (err) {
                            console.log(err);
                            return
                        } else {
                            req.flash("success", "You are new registered and can login");
                            res.redirect("/users/login")
                        }
                    })
                });
            })
        }
    })
//Login Form
router.get('/login', function (req, res) {
    res.render('login')
})

//login Process
router.post('/login', function (req, res, next) {
    passport.authenticate("local", {

        successRedirect: "/",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next)
})

// Logout

router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "You are logged out");
    res.redirect('users/login')
})
module.exports = router;