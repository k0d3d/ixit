var
    jwt = require('jsonwebtoken'),
    appConfig = require('config').express,
    User = require('../../models/user.js'),
    _ = require('lodash'),
    util = require('util'),
    passport = require('passport');

module.exports.routes = function (app, redis_client) {

  app.param('userId', function (req, res, next, id) {
    var users = new User();
    users.findUser(id)
    .then(function (r) {
      req.user = r;
      next();
    })
    .fail(function (err) {
      next(err);
    })
    .done();
  });


  //Authentication Api Routes
  app.route('/api/v2/users/auth')
  .post(function (req, res) {
    if (req.user) {
      // redis_client.hmset(token, req.user);
      res.json({
        authorizationToken: true
      });
    } else {
      res.json(401, {message: 'Authorized only.'});
    }
  });

  //Authentication Api Routes
  app.route('/api/v1/users/auth')
  .post(passport.authenticate('local', { session: false }), function (req, res) {
    if (req.user) {
      var token = jwt.sign(req.user, appConfig.secret);
      redis_client.hmset(token, req.user);
      res.json({
        authorizationToken: token
      });
    } else {
      res.json(401, {message: 'Authorized only.'});
    }
  });

  //
  //Activities
  //

  //
  //User Profile
  //
  app.route('/api/:apiVersion/users')
  //gets the profile information for the curently logged
  //in user
  .get(function (req, res, next) {
    var userId = req.user._id;
    var users = new User();
    users.getProfile(userId, 'BASIC')
    .then(function (r) {
      res.json(200, r);
      // res.json(200, _.extend(req.user.toJSON(), r));
      // res.render('user/profile', {
      //   userProfile: r || {},
      //   userData: req.user
      // });
    }, function (err) {
      next(err);
    });
  })
  //updates the profile for the currently
  //logged in user
  .put(function (req, res, next) {
    var userId = req.user._id;
    var users = new User();
    users.updateUserAccount(userId, _.extend({scope: 'PROFILE'}, _.pick(req.body, ['firstname', 'lastname', 'phoneNumber'])))
    .then(function (r) {
      res.json(r);
    }, function (err) {
      console.log(err);
      next(err);
    });
  })
  //creates a new user account
  .post(function (req, res) {
    var users = new User();
    var createUser = users.create(req.body);
    createUser.then(function (r) {
      console.log('register user');
      return res.json(200, r);
    }, function (err) {
      return res.json(400, err );
    });
  });

  //logs out a currently logged in user
  // app.delete('/api/:apiVersion/users/auth', users.signout);

  // app.param('userId', users.user);
};