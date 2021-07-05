var express = require('express');
var passport = require('passport');
const User = require('../database/models/user');
var authenticated = require('./authenticated');
var router = express.Router();

router.post('/login', passport.authenticate('local'), (req, res, next) => {
    console.log('login');
    req.session.save((err) => {
        if (err) {
            console.log(JSON.stringify(err));
            return next(err);
        }
        res.status(200).end();
    });
});

router.post('/logout', authenticated, (req, res, next) => {
    console.log('logout');
    req.logout();
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.status(200).end();
    });
});

router.get('/info', authenticated, (req, res, next) => {
    console.log('user: ' +  req.user);
    if (req.user) {
        res.status(200).json({ 
            avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
            name: req.user.username,
            roles: req.user.roles
        });
    } else {
        res.status(404).end("User not found");
    }
});

router.post('/register', (req, res, next) => {
    let username = req.body.username;
    console.log("username: ", username);

    User.register(new User({ username : req.body.username, roles: req.body.roles }), req.body.password, (err, user) => {
        if (err) {
            console.log(JSON.stringify(err));
            return res.status(404).send(err.message);
        }

        passport.authenticate('local')(req, res, () => {
            req.session.save((err) => {
                if (err) {
                    return next(err);
                }
                res.status(200).end();
            });
        });
    });
});

module.exports = router;
