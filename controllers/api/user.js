var
    jwt = require('jsonwebtoken'),
    appConfig = require('config').express,
    User = require('../../models/user.js'),
    _ = require('lodash'),
    util = require('util'),
    passport = require('passport');

module.exports.routes = function (app, redis_client) {
  var users = new User();

  app.param('userId', function (req, res, next, id) {
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
  app.route('/api/v1/users/profile')
  .get(function (req, res, next) {
    var userId = req.user._id;
    var account_type = req.user.account_type;
    users.getProfile(userId, account_type).then(function (r) {
      res.json(200, r);
      // res.json(200, _.extend(req.user.toJSON(), r));
      // res.render('user/profile', {
      //   userProfile: r || {},
      //   userData: req.user
      // });
    }, function (err) {
      next(err);
    });
  });

  //Setting up the users api
  app.post('/api/v1/users', function (req, res) {
    var createUser = users.create(req.body);
    createUser.then(function (r) {
      return res.json(200, r);
    }, function (err) {
      return res.json(400, err );
    });
  });

  //logs out a currently logged in user
  // app.delete('/api/v1/users/auth', users.signout);

  // app.param('userId', users.user);
};