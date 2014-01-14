/**
 * Module dependencies.
 */
 var mongoose = require('mongoose'),
 User = mongoose.model('User'),
 hashr = require('../../lib/hash.js'),
 _ = require('underscore'),
 util = require('util'),
 fs = require('fs'),
 path = require('path'),
 rest = require('restler'),
 config =  require('../../config/config'),
 passport = require('passport');



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
  res.jsonp({
    "email": req.user.email,
    "photo": req.user.photo,
    "username": req.user.username,
    "firstname": req.user.firstname,
    "lastname": req.user.lastname
  } || null);
};

/**
 * Find user by id
 */
 Users.prototype.user = function(req, res, next, id) {
  var oid = hashr.unhashOid(id);
  User
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
 * [update upates user account information]
 * @param  {[type]}   userId      [description]
 * @param  {[type]}   updatedInfo [description]
 * @param  {Function} callback    [description]
 * @return {[type]}               [description]
 */
 Users.prototype.updateUser = function(updatedInfo, callback){
  var o = _.omit(updatedInfo, ['_id', 'username', 'email']);
  User.update({
    _id: hashr.unhashOid(updatedInfo._id)
  }, {
    $set: o
  })
  .exec(function(err, ar){
    if(err) return callback(err);
    callback(ar);
  });
};

/**
 * [fetchphoto fetches the profile photo for the logged in user or id]
 * @param  {[type]}   id       [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
 Users.prototype.fetchphoto = function(id, callback){
  var filename = path.normalize('app','users','img', id);
  var al = 'prettyme.png';
  fs.exists(filename, function(huh){
    al = huh;
  });
  callback(al);
};

Users.prototype.postphoto = function(req, cb){
  var tempPath = req.files.pp.path,
  targetPath = path.resolve('./app/users/img/'+ hashr.hashOid(req.session.passport.user));
  fs.rename(tempPath, targetPath, function(err) {
    if (err) throw err;
    cb(hashr.hashOid(req.session.passport.user));
  });
};

Users.prototype.getAPIKey = function(id, hasClientKey, cb){
  if(hasClientKey){
    User.findOne({
      _id: id
    },'clientKey')
    .exec(function(err, i){
      if(err) return cb(new Error(cb));
      cb(i);
    });
  }else{
    rest.post(config.api_url+'/clients/',{
      data: {user: id},
      headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
    })
    .on('success', function(data){
      User.update({
        _id: id
      }, {
        $set: {
          clientKey: data.clientKey,
          isDeveloper: true
        }
      }, function(err){
        if(err) return cb(new Error(err));
        cb(data);
      });
      console.log(data);
    })
    .on('error', function(data, err){
      cb(new Error(err));
    });
  }
};

var users = new Users();
module.exports.users = users;

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
    //app.post('/api/users/session', passport.authenticate('local'), users.session);
    app.post('/api/users/session', function(req, res, next){
      passport.authenticate('local', function(err, user){
        if (err) return next(err);
        if(!user) return res.json(400, {message: 'User not found'});
        req.logIn(user, function(err){
          if(err) return next(err);
          req.user = {
            username: user.username
          };
          if(!_.isUndefined(user.isDeveloper)){
            req.user.isDeveloper = user.isDeveloper;
          }
          return res.json(200, {status: true});
        });
      })(req, res, next);
    });

    app.get('/users/me', users.me);
    app.get('/users/:userId', users.show);

    app.get('/users/developer/apikey', function(req, res, next){
      var hasClientKey = false;
      if(!_.isUndefined(req.user.isDeveloper)){
        hasClientKey = req.user.isDeveloper;
      }
      var userid = req.session.passport.user;
      users.getAPIKey(userid, hasClientKey, function(r){
        if(util.isError(r)){
          next(r);
        }else{
          res.json(200, r);
        }            
      });
    });

    //Change user profile information
    app.put('/users/me/', function(req, res, next){
      users.updateUser(req.body, function(r){
        if(util.isError(r)){
          next(r);
        }else{
          res.json(200, true);
        }
      });
    });

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

    //Fetch user profile photo
    app.get('/user/:userId/img', function(req, res, next){
      users.fetchphoto(req.params.userId, function(r){
        if(util.isError(r)){
          next(r);
        }else{
          res.sendfile(path.resolve('./app/users/img/'+r));
        }
      });
    });


    app.post('/user/account/photo', passport.ensureAuthenticated, function(req, res, next){
      users.postphoto(req, function(r){
        if(util.isError(r)){
          next(r);
        }else{
          res.json(200, r);
        }
      })
    });

    //Finish with setting up the userId param
    app.param('userId', users.user);

  };

