var
    appConfig = require('config').express,
    passport = require('passport'),
    cors = require('cors');

module.exports.routes = function (app, redis_client) {

  // app.route('/api/v2/*')
  // .all(cors(appConfig.cors.options),  function (req, res, next) {
  //   if (req.xhr) {
  //     res.set('WWW-Authenticate',  'xBasic realm="Users"');
  //   }
  //   next();
  // });
  // app.route('/api/v2/*')
  // .all(cors(appConfig.cors.options), passport.isAPIAuthenticated, function (req, res, next) {
  //   if (req.xhr) {
  //     res.set('WWW-Authenticate',  'xBasic realm="Users"');
  //   }
  //   next();
  // });

  app.route('/api/v2/*')
  .all(cors(appConfig.cors.options),
    function(req, res, next){
      if (
        (req.url === '/api/v2/users' && req.method === 'POST')
      ) {
        next();
      } else {
        passport.isAPIAuthenticated.call(null, req, res, next);
      }
    },
    // passport.isAPIAuthenticated,
    function (req, res, next) {
      if (req.xhr) {
        res.set('WWW-Authenticate',  'xBasic realm="Users"');
      }
      next();
  });





  //testing if server is online...
  app.get('/api/v2/routetest', function (req, res) {
    res.json(200, true);
  });

  //load the oauth routes
  require('./oauth-server/oauth-server').routes(app, redis_client);
};