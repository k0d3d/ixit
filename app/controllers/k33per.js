/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport'),
    rest = require('restler'),
    hashr = require('../../lib/hash.js'),
    _ = require('underscore'),
    api_url = 'http://192.168.1.7:3000',
    config = require('../../config/config'),
    commons = require('../../lib/commons'),
    util = require('util');
    redis = require('redis'),
    redis_client = redis.createClient();

function strip_files_result(mongooseResult, callback){
  var h = {};
  _.each(mongooseResult, function(v, i){
    var ixid = hashr.hashInt(v.mediaNumber);
    var n = _.omit(v, ['_id', 'chunkCount', 'progress', 'identifier', '__v', 'mediaNumber']);
    h[i] = _.extend({
      ixid: ixid
    }, n);

    if(mongooseResult.length === i + 1){
      callback(h);
    }
  });
}

function strip_queue_result(mongooseResult, callback){
  var h = {};
  _.each(mongooseResult, function(v, i){
    //var ixid = hashr.hashInt(v._id);
    var l = v.owner+'-';

    var n = _.omit(v, ['_id', 'chunkCount', 'progress', 'visible', 'downloadCount', '__v', 'owner', 'identifier', 'completedDate']);
    h[i] = _.extend({
      identifier: v.identifier.substr(l.length)
    }, n);

    if(mongooseResult.length === i + 1){
      callback(h);
    }
    console.log(i);
  });
}

// K33per Object
function K33per (){

}

K33per.prototype.constructor = K33per;

K33per.prototype.getUsersFiles = function(userId, callback){
  rest.get(config.api_url+'/user/'+userId+'/files', {
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
  }).on('success', function(data, response){
    if(_.isEmpty(data)){
      return callback({}, response);
    }
    //Remove unecessary propertied and has the mongooseid;
    strip_files_result(data, function(r){
      callback(r, response);
    });
  }).on('error', function(err, response){
    callback(err);
  });
};

K33per.prototype.getUserQueue = function(userId, callback){
  rest.get(config.api_url+ '/user/'+userId+'/queue',{
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
  }).on('success', function(data, response){
    if(_.isEmpty(data)){
      return callback({}, response);
    }     
    //Remove unecessary propertied and has the mongooseid;
    console.log(data);
    strip_queue_result(data, function(r){
      callback(r, response);
    });
  }).on('error', function(err){
    callback(err);
  });
};

K33per.prototype.deleteUserFile = function(userId, fileId, callback){
  fileId = hashr.unhashInt(fileId);
  rest.del(config.api_url+'/user/'+userId+'/file/'+fileId,{
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
  }).on('success', function(result, response){
    callback(result, response);
  }).on('error', function(err){
    callback(err);
  });
};

K33per.prototype.removeUserQueue = function(mediaNumber, owner, callback){
  rest.del(config.api_url+'/user/'+owner+'/queue/'+mediaNumber, {
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
  }).on('success', function(result){
    callback(result);
  }).on('error', function(err){
    callback(err);
  });
};

K33per.prototype.updateTags = function(file_id, owner, tags, cb){
  var fileId = hashr.unhashInt(file_id);
  rest.put(config.api_url+'/user/'+owner+'/file/'+fileId+'/tags', {
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent },
    data: {tags: tags}
  })
  .on('success', function(result){
    cb(result);
  })
  .on('error', function(err){
    cb(err);
  });
};


K33per.prototype.search = function(query, cb){
  rest.get(config.api_url+'/media/search/'+query,{
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
  })
  .on('success', function(result){
    cb(result);
  })
  .on('error', function(err){
    cb(err);
  });
};

K33per.prototype.downloadPage = function(mediaId, cb){
  //return cb(true);
  rest.get(config.api_url+'/user/media/'+mediaId,{
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
  })
  .on('complete', function(rz, rs){
    if(rs.statusCode === 404 ||rs.statusCode === 400 || rs.length < 1) return cb(new Error('not found'));
    return cb(rz);
  });
};

K33per.prototype.requestFileDownload = function(mediaId, cb){
  // console.log(mediaId);
  // return redis_client.hgetall('downloadId:'+mediaId, function(err, obj){
  //console.dir(obj);
  // });
  redis_client.hmget('downloadId:'+mediaId, 'mediaNumber', function(err, reply){
    if(err){
      cb(err);
    }else{
      cb(config.api_url+'/download/'+reply.toString());
    }
  });
};

/**
 * counts the number of files and the amount of diskspace used.
 * Excluding files in the trash can.
 * @param  {[type]}   userId [description]
 * @param  {Function} cb     [description]
 * @return {[type]}          [description]
 */
K33per.prototype.count = function(userId, cb){
  rest.get(config.api_url+'/user/'+userId+'/media/count', commons.restParams())
  .on('complete', function(data){
    cb(data);
  });
};

/**
 * creates a new folder 
 * @param  {String}   foldername [description]
 * @param  {ObjectId}   parent     [description]
 * @param  {String}   owner      [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
K33per.prototype.createFolder = function(foldername, parent, owner, cb){
  rest.post(config.api_url+'/user/'+owner+'/folder', commons.restParams())
  .on('complete', function(data){
    cb(data);
  });
};

module.exports.keeper = K33per;

var k33per = new K33per();

module.exports.routes = function(app){
  app.get('/api/user/files', function(req, res, next){
    var owner = hashr.hashOid(req.session.passport.user);
    k33per.getUsersFiles(owner, function(r){
      if( r instanceof Error){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  app.get('/api/user/queue', function(req, res, next){
    var owner = hashr.hashOid(req.session.passport.user);
    k33per.getUserQueue(owner, function(r){
      if( r instanceof Error){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });
  //Searches for files using filenames and tags
  app.get('/api/search/:queryString', function(req, res, next){
    k33per.search(req.params.queryString, function(r){
      if(util.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  app.get('/api/media/:mediaId/request/', function(req, res, next){
    k33per.requestFileDownload(req.params.mediaId, function(r){
      if(util.isError(r)){
        next(r);
      }else{
        res.redirect(r);
      }
    });
  });


  app.post('/api/user/folder', function(req, res, next){
    var owner = hashr.hashOid(req.session.passport.user);
    k33per.createFolder( req.body.name, req.body.parent, owner, function(r){
      if(util.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  }); 

  //Update tags for a file
  app.put('/api/user/files/:fileId/tags', function(req, res, next){
    var tags = req.body.tags;
    var file_id = req.params.fileId;
    var owner = hashr.hashOid(req.session.passport.user);
    k33per.updateTags(file_id, owner, tags, function(d){
      if(util.isError(d)){
        next(d);
      }else{
        res.json(200, d);
      }
    });
  });


  app.del('/api/user/files/:fileId', function(req, res, next){
    var owner = hashr.hashOid(req.session.passport.user);
    var file = req.params.fileId;
    k33per.deleteUserFile(owner, file, function(r){
      if( r instanceof Error){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  //Delete a file on the upload queue
  app.del('/api/user/queue/:queueId', function(req, res, next){
    var owner = hashr.hashOid(req.session.passport.user); 
    var mediaNumber = req.params.queueId;
    k33per.removeUserQueue(mediaNumber, owner, function(r){
      if( r instanceof Error){
        next(r);
      }else{
        res.json(200, r);
      }   });
  }); 
}
