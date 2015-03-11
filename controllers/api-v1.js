var path = require('path'),
    expressJWT = require(path.join(process.cwd(), 'lib/node_modules/express-jwt/lib/index.js')),
    appConfig = require('config').express,
    cors = require('cors');

module.exports.routes = function (app) {

  app.route('/api/v1/*')
  .all(cors(appConfig.cors.options), function (req, res, next) {
    //if we are requesting the
    //authentication route, please skip
    //to the next route..
    //should be handled
    if ((req.url === '/api/v1/users/auth' || req.url === '/api/v1/users') && req.method === 'POST') {
      next();
    } else {
      if (req.headers.authorization) {
        expressJWT({
          secret: appConfig.secret,
          skip: ['/api/v1/users/session', '/api/v1/routetest']
        })
        .call(null, req, res, next);
      } else {
        res.json(403, {status: 'not authd'});
      }
    }
  });

  //testing if server is online...
  app.get('/api/v1/routetest', function (req, res) {
    res.json(200, true);
  });

};