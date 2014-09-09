var
    jwt = require('jsonwebtoken'),
    appConfig = require('config').express,
    User = require('../../models/user.js'),
    _ = require('lodash'),
    passport = require('passport');

module.exports.routes = function (app) {
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
  app.route('/api/v1/users/session')
  .post(passport.authenticate('local', { session: false }), function (req, res) {
    if (req.user) {
      res.json({
        authorizationToken: jwt.sign(req.user, appConfig.secret, {expiresInMinutes: 60 * 30})
      });
    } else {
      res.json(401, {message: 'Authorized Staffs only.'});
    }
  });

  app.get('/api/v1/routetest', function (req, res) {
    res.json(200, true);
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
};