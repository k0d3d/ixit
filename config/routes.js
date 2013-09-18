var async = require('async');

/**
 * Expose routes
 */

module.exports = function (app, passport, auth) {
  // home route


  // var orders = require('../app/controllers/orders');
  // orders.routes(app);

  app.get('/', function(req, res){
      res.render('index');
    }
  );

  /*
  Authentication and User routes
   */
  var users = require('../app/controllers/users');
  console.log(users);
  users.routes(app);


  app.get('/partials/:name', function (req, res) {
      var name = req.params.name;
      res.render('partials/' + name);
    }
  );
  
  // home route
  app.get('/:parent/:child', function(req, res){
    var parent = req.params.parent;
    var child = req.params.child;
      res.render(parent+'/'+child);
      //res.render('/');
    }
  );
}