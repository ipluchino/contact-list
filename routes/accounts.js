const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

router.get('/login', async (req, res) => {
    res.render('login', { hide_login: true });
});

router.post('/login', async(req, res) => {
    const username = req.body.username.trim();
    const password = req.body.password.trim();

    const user = await req.db.findUserByUsername(username);

    if (user && bcrypt.compareSync(password, user.Password)) {
        req.session.user = user;
        res.redirect('/');
        return;
    }
    else
    {
        res.render('login', { hide_login: true, message: 'Login failed. Please try again.'});
        return;
    }
});

router.get('/signup', async (req, res) => {
    res.render('signup', { hide_login: true });
});

router.post('/signup', async(req, res) => {
    const username = req.body.username.trim();
    const p1 = req.body.password.trim();
    const p2 = req.body.password2.trim();
    
    //Making sure the passwords are confirmed to be the same.
    if(p1 != p2) {
        res.render('signup', { hide_login: true, message: 'Your passwords do not match. Signup failed.'});
        return;
    }

    //Making sure an account with this username doesn't already exist.
    const user = await req.db.findUserByUsername(username);
    if (user) {
        res.render('signup', { hide_login: true, message: 'An account with this username already exists. Signup failed'});
        return;
    }
    
    //Creating the account with a hashed password.
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(p1, salt);

    const id = await req.db.createAccount({
        First_Name: req.body.first,
        Last_Name: req.body.last,
        Username: username,
        Password: hash
    });

    req.session.user = await req.db.findUserByID(id);

    //Once signed up, the user will automatically be logged in and able to continue using the site.
    res.redirect('/');
});

router.get('/logout', async(req, res) => {
    req.session.user = undefined;
    res.redirect('/');
});

module.exports = router;