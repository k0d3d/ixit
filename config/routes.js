var async = require('async');
var passport = require("passport");
var fs = require('fs');
var path = require('path');
var hashr = require('../lib/hash.js');
var common = require('../lib/commons.js');
var util = require('util');
var mime = require('mime');
var clientSession = require('./middlewares/client_session');
var moment = require('moment'),
    redis = require('redis'),
    redis_client = redis.createClient();

/**
 * Expose routes
 */

module.exports = function (app, passport, auth) {
  // home route
  app.get('/', clientSession, function(req, res){
    res.render('index');
  });

  /*
  Authentication and User routes
   */
  var users = require('../app/controllers/users');
  users.routes(app);

  app.all('/dashboard', passport.ensureAuthenticated, clientSession);
  var dashboard = require('../app/controllers/dashboard');
  dashboard.routes(app);

  var keeper = require('../app/controllers/k33per.js');
  keeper.routes(app);

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
  });

  app.get('/:hashrid', clientSession, function(req, res, next){
    var mediaId = hashr.unhashInt(req.params.hashrid);
    keeper.keeper.downloadPage(mediaId, function(r){
      if(util.isError(r)){
        next(r);
      }else{
        var od = {
            blah: r.filename,
            completedDate: moment(r.completedDate).calendar(),
            size: common._formatFileSize(r.size),
            downloadCount: r.downloadCount,
            tags: r.tags,
            mediaNumber: r.mediaNumber,
            type: mime.extension(r.type),
            identifier: r.identifier,
            title: 'IXIT :: Download '+r.filename
          };

        redis_client.hmset('downloadId:'+r.mediaNumber, od, function(err, i){
          console.log(err, i);
        });
        res.render('public/download', od);
      }
      
    });
  });  


  app.get('/img/filetype/:filename', function(req, res, next){
      var filename = req.params.filename;
      fs.exists('/public/img/filetype/'+filename, function(itdz){
          if(itdz){
              res.sendfile('/public/img/filetype/'+filename);
          }else{
              res.sendfile(path.resolve('./public/img/no-img.png'));
          }
      })
  });
}