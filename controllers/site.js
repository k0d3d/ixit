
// routes for app views and templates
module.exports = function (app, isLoggedIn, passport) {
  // home route
  app.get('/', function(req, res){
    res.render('index');
  });
  // home route
  app.get('/home', function(req, res){
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