/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require("passport");



//Initiate the user object
function Users (){

}

Users.prototype.constructor = Users;
/**
 * Auth callback
 */
Users.prototype.authCallback = function(req, res, next) {
    res.redirect('/');
};

/**
 * Show login form
 */
Users.prototype.signin = function(req, res) {
    res.render('users/signin', {
        title: 'Sign In',
        message: req.flash('error')
    });
};

/**
 * Show sign up form
 */
Users.prototype.signup = function(req, res) {

};

/**
 * Logout
 */
Users.prototype.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
Users.prototype.session = function(req, res) {
    res.json(200, {status: true});
};

/**
 * Create user
 */
Users.prototype.create = function(req, res) {
    var user = new User(req.body.param);

    user.provider = 'local';
    user.save(function(err) {
        if (err) {
            return res.json(400, {
                errors: err,
            });
        }
        return res.json(200, {status: true});
    });
};

/**
 *  Show profile
 */
Users.prototype.show = function(req, res) {
    var user = req.profile;

    res.render('users/show', {
        title: user.name,
        user: user
    });
};

/**
 * Send User
 */
Users.prototype.me = function(req, res) {
    res.jsonp(req.user || null);
};

/**
 * Find user by id
 */
Users.prototype.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};

module.exports.routes = function(app){
    /*
    General Index Page Loader
    */
    //Login Page
    app.get('/login', function(req, res){
        res.render('index');
    });

    //Register Page
    app.get('/register', function(req, res){
        res.render('index');
    });

    //Recover Password
    app.get('/recover', function(req, res){
        res.render('index');
    });

    app.get('/logout', users.signout);

    //Setting up the users api
    app.post('/api/users', users.create);
    
    //User Login
    app.post('/api/users/session', passport.authenticate('local'), users.session);

    app.get('/users/me', users.me);
    app.get('/users/:userId', users.show);

    //Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me'],
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the twitter oauth routes
    app.get('/auth/twitter', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Setting the google oauth routes
    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/signin',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }), users.signin);

    app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin'
    }), users.authCallback);

    //Finish with setting up the userId param
    app.param('userId', users.user);

};

var users = new Users();
module.exports.users = users;