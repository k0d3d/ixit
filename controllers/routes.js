var fs = require('fs');
var path = require('path');
var hashr = require('../lib/hash.js');
var common = require('../lib/commons.js');
var util = require('util');
var mime = require('mime');
//var clientSession = require('../lib/middlewares/client_session');
var isLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var isLoggedOut = require('connect-ensure-login').ensureLoggedOut;
var moment = require('moment');

/**
 * Expose routes
 */

module.exports = function (app, passport, redis_client) {

  /*
  API Authentication and User routes
   */



  var apiV1 = require('./api-v1');
  apiV1.routes(app, redis_client, isLoggedIn);

  var apiV2 = require('./api-v2');
  apiV2.routes(app, redis_client);

  // var users = require('./users');
  // users.routes(app, redis_client);

  //load the api routes
  require('./api/user').routes(app, redis_client);

  var dashboard = require('./dashboard');
  dashboard.routes(app, isLoggedIn, passport);

  var keeper = require('./k33per');
  keeper.routes(app, redis_client, isLoggedIn);

  var tokenRequest = require('../lib/middlewares/dk33pTokenRequest');

  /**
   * Views and template routes
   */
  require('./site.js')(app, isLoggedOut, passport, tokenRequest);


  app.get('/:hashrid', function(req, res, next){
    var mediaId = hashr.unhashInt(req.params.hashrid);
    var k = new keeper.K33per();
    k.downloadPage(mediaId, function(r){
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
          // console.log(err, i);
        });
        res.render('public/download', od);
      }

    });
  });


  app.get('/img/filetype/:filename', function(req, res, next){
      var filename = req.params.filename;
      // console.log(filename);
      fs.exists('/public/img/filetype/'+filename, function(itdz){
          if(itdz){
              res.sendfile('/public/img/filetype/'+filename);
          }else{
              res.sendfile(path.resolve('./public/img/no-img.png'));
          }
      });
  });
};