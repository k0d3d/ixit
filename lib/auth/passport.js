var
    LocalStrategy = require('passport-local').Strategy,
    // OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
    BasicStrategy = require('passport-http').BasicStrategy,
    DigestStrategy = require('passport-http').DigestStrategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    // passport = require('passport'),
    OAuth2 = require('../../models/oauth2'),
    Token = require('../../models/oauth2/access_token'),
    User = require('../../models/user'),
    hashr = require('../hash.js');


module.exports = function(passport, redis_client) {

    // Simple route middleware to ensure user is authenticated.  Otherwise send to login page.
    passport.ensureAuthenticated = function ensureAuthenticated(req, res, next) {

      if (req.isAuthenticated()) {
        res.cookie('throne',hashr.hashOid(req.session.passport.user), {maxAge: 24 * 60 * 60 * 1000, httpOnly: false});
        console.log('yes is');
        return next();
      }
      res.redirect('#/login');
    };

    // Check for admin middleware, this is unrelated to passport.js
    // You can delete this if you use different method to check for admins or don't need admins
    passport.ensureAdmin = function ensureAdmin(req, res, next) {
      if(req.user && req.user.admin === true)
        next();
      else
        res.send(403);
    };

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        var user = new User();
        user.findUserObject({
            userId: id
        }).then(function(r) {
            done(null, r);
        });
    });

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
      }, function(req, email, password, done) {
        console.log('in ixit local strategy');

        var user = new User();

        user.checkAuthCredentials(email, password, req).then(function(r) {
            // console.log('Received user Info');
            //Expects the user account object
            return done(null, r);
        }, function(err) {
            // console.log('user credentials were not valid');
            //return done(err)
            // we don't need to return the specific error here, just that there was an error
            return done(null);
        });

    }));


    /**
     * BasicStrategy & ClientPasswordStrategy
     *
     * These strategies are used to authenticate registered OAuth clients.  They are
     * employed to protect the `token` endpoint, which consumers use to obtain
     * access tokens.  The OAuth 2.0 specification suggests that clients use the
     * HTTP Basic scheme to authenticate.  Use of the client password strategy
     * allows clients to send the same credentials in the request body (as opposed
     * to the `Authorization` header).  While this approach is not recommended by
     * the specification, in practice it is quite common.
     */
    passport.use('client-basic', new BasicStrategy(

    function(clientId, clientSecret, done) {
        var oauth2 = new OAuth2();

        oauth2.findClient({
            key: clientId
        }).then(function(client) {
            //If client not found
            if (!client) {
                return done(null, false);
            }
            //If client found but password mismatch
            if (client.clientSecret != clientSecret) {
                return done(null, false);
            }
            //All good proceed
            return done(null, client);

        }, function(err) {
            //Error occurs with query
            if (err) {
                return done(err);
            }
        });
    }));


    /**
     * BearerStrategy
     *
     * This strategy is used to authenticate users based on an access token (aka a
     * bearer token).  The user must have previously authorized a client
     * application, which is issued an access token to make requests on behalf of
     * the authorizing user.
     */
    passport.use(new BearerStrategy(
      function(accessToken, done) {
        //find token, then find user
        var oauth2 = new OAuth2();
        oauth2.findToken(accessToken).then(function(token) {
            if (!token) {
                console.log('no token found :(');
                return done(null, false);
            }
            console.log('success! token found');

            var user = new User();

            user.findUser(token.user )
            .then(function (user) {
              // No user found
              if (!user) { return done(null, false); }

              // Simple example with no scope
              done(null, user, { scope: '*' });

            }, function (err) {
              if (err) { return done(err); }
            });

        }, function(err) {
            if (err) {
                return done(err);
            }
        });
      }
    ));


    passport.use(new DigestStrategy(
      { algorithm: 'MD5', qop: 'auth' },
      function(username, callback) {
        User.findOne({ username: username }, function (err, user) {
          if (err) { return callback(err); }

          // No user found with that username
          if (!user) { return callback(null, false); }

          // Success
          return callback(null, user, user.password);
        });
      },
      function(params, callback) {
        // validate nonces as necessary
        callback(null, true);
      }
    ));


    passport.use(new ClientPasswordStrategy(

    function(clientId, clientSecret, done) {
        var oauth2 = new OAuth2();

        oauth2.findClient({
            key: clientId
        }).then(function(client) {
            //If client not found
            if (!client) {
                return done(null, false);
            }
            //If client found but password mismatch
            if (client.clientSecret != clientSecret) {
                return done(null, false);
            }
            //All good proceed
            return done(null, client);

        }, function(err) {
            //Error occurs with query
            if (err) {
                return done(err);
            }
        });

    }));

    //used for API endpoint authentication
    passport.isAPIAuthenticated = passport.authenticate(['basic', 'bearer'], { session : false });
    // passport.isAPIAuthenticated = passport.authenticate(['local', 'bearer'], { session : false });
    passport.isClientAuthenticated = passport.authenticate('client-basic', { session : false });
    passport.isBearerAuthenticated = passport.authenticate('bearer', { session: false });


    passport.use(new BasicStrategy({
      passReqToCallback: true
    },
      function(req, username, password, done) {
        var user = new User();

        user.checkAuthCredentials(username, password, req).then(function(r) {
            // console.log('Received user Info');
            //Expects the user account object
            return done(null, r);
        }, function(err) {
            console.log('user credentials were not valid');
            console.log(err);
            //return done(err)
            // we don't need to return the specific error here, just that there was an error
            return done(null);
        });
      }
    ));
};