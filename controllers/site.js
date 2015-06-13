var config = require('config');
// routes for app views and templates
module.exports = function (app, isLoggedOut) {
  // home route
  app.use(function (req, res, next) {
    res.locals.dk33p_api_url = config.dkeep_api_url + '/upload';
    next();
  });

  // home route
  app.get('/', isLoggedOut('/dash'), function(req, res){
    res.render('index');

  });
  // home route
  app.get('/home', isLoggedOut(), function(req, res){
    res.render('index');
  });

  /** public authentication and verification view routes **/

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

  app.get('/templates/:parent/:name', function (req, res) {
      var name = req.params.name;
      var parent = req.params.parent;
      res.render('templates/' + parent + '/' + name);
    }
  );

  // home route
  app.get('/:parent/:child', function(req, res){
    var parent = req.params.parent;
    var child = req.params.child;
    res.render(parent+'/'+child);
      //res.render('/');
  });

};