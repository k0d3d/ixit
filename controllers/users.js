/**
 * Module dependencies.
 */
 var hashr = require('../lib/hash.js');



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
 * Find user by id
 */
 Users.prototype.user = function(req, res, next, id) {
  var oid = hashr.unhashOid(id);
  UserModel
  .findOne({
    _id: oid
  })
  .exec(function(err, user) {
    if (err) return next(err);
    if (!user) return next(new Error('Failed to load User ' + id));
    req.profile = user;
    next();
  });
};



/**
 * Registers a new user, checks if the user's email
 * is blacklisted, greylisted, whitelisted.
 * @param  {[type]}   options [description]
 * @param  {Function} cb      [description]
 * @return {[type]}           [description]
 */
Users.prototype.register = function (options, cb) {
  var user = new UserModel();
  var createUser = user.create(options);
  createUser.then(function (result) {
    cb(result);
  }, function (err) {
    cb(err);
  });
  // createUser.catch(function (err) {
  //   console.log(err);
  //   cb(err);
  // });
};

module.exports = Users;


