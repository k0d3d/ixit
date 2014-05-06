/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = require('../models/user.js'),
    passport = require('passport'),
    rest = require('restler'),
    hashr = require('../lib/hash.js'),
    _ = require('lodash'),
    config = require('config'),
    commons = require('../lib/commons'),
    util = require('util'),
    //redis = require('redis'),
    EventRegister = require('../lib/event_register').register;
    //redis_client = redis.createClient();

function strip_files_result(m){
  //if its an array use the map function to loop 
  //over the process
  if(util.isArray(m)){
    return _.map(m, function(v){
      var ixid = hashr.hashInt(v.mediaNumber);
      var n = _.omit(v, ['_id', 'chunkCount', 'progress', 'identifier', '__v', 'mediaNumber']);
      return _.extend({ixid: ixid}, n);
    });
  }else{
    //Just one object
    var ixid = hashr.hashInt(m.mediaNumber);
    var n = _.omit(m, ['_id', 'chunkCount', 'progress', 'identifier', '__v', 'mediaNumber']);
    return _.extend({ixid: ixid}, n);    
  }

}
function strip_folder_result(m){
  //If its an array
  if(util.isArray(m)){
    return _.map(m, function(v){
      var id = hashr.hashOid(v._id);
      var n = _.omit(v, ['_id', 'folderId', 'visible', '__v']);
      return _.extend({id: id}, n);
    });    
  }else{
    //Just one object
    var id = hashr.hashOid(m._id);
    var n = _.omit(m, ['_id', 'folderId', 'visible', '__v']);
    return _.extend({id: id}, n);    
  }

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
  });
}

// K33per Object
function K33per (){

}

K33per.prototype.constructor = K33per;

/**
 * request the logged in user's home folder id.
 * @param  {[type]}   user [description]
 * @param  {Function} cb   [description]
 * @return {[type]}        [description]
 */
K33per.prototype.loadHome = function(user, cb){
  rest.get(config.api_url+'/user/'+user+'/home', commons.restParams())
  .on('complete', function(r){
    cb(r._id);
  });
};

/**
 * requests for files belonging to a folder
 * @param  {[type]}   user [description]
 * @param  {Function} cb   [description]
 * @return {[type]}        [description]
 */
K33per.prototype.loadFolder = function(user, options, cb){
  var register = new EventRegister();

  var cab = {};

  //Event send d request for the folder content
  register.once('reqFolder', function(data, isDone){
    rest.get(config.api_url+'/user/'+user+'/folder?id='+options.id+'&parentId='+options.parentId, commons.restParams())
    .on('complete', function(r){

      isDone(r);
    });    
  });

  //Event strips out propeties that shouldnt be sent to the view from the 
  //files object
  register.once('stripOnFiles', function(data, isDone){

    if (_.isEmpty(data.files) || !data.files) {
      cab.files = [];
    } else {
    //Remove unecessary properties and hash the ObjectId;
    //Keep the stripped result in 
    //the files property   
      cab.files = strip_files_result(data.files);
    }
    
    //Pass in data again so the next event
    //can use it    
    isDone(data); 
  });

  //Event strips out propeties that shouldnt be sent to the view from the 
  //files object
  register.once('stripOnFolder', function(data, isDone){
    if (_.isEmpty(data.folders || !data.folders)) {
      cab.folders = [];
    } else {
      //Remove unecessary properties and hash the ObjectId;
      //Keep the stripped result in 
      //the folders property   
      //console.log(r);     
      cab.folders = strip_folder_result(data.folders);
    }
    //pass it on, nothing to do thou
    isDone(cab);
      
  });

  register
  .queue('reqFolder', 'stripOnFiles', 'stripOnFolder')
  .onEnd(function(data){
    cb(data);
  })
  .onError(function(err){
    cb(err);
  })
  .start(cab);
};

/**
 * send a request to create a new folder or a new subfolder.
 * @param  {String}   foldername [description]
 * @param  {ObjectId}   parent     [description]
 * @param  {String}   owner      [description]
 * @param  {Function} cb         [description]
 * @return {[type]}              [description]
 */
K33per.prototype.createFolder = function(foldername, parent_id, type, owner, cb){
  console.log('Attempting to create new folder.');
  var dataTo = {
      name: foldername,
      parent: hashr.unhashOid(parent_id),
      type: type
    };

  var register = new EventRegister();

  //Event send d request for the folder to be created
  register.once('reqNewFolder', function(data, isDone){
    rest.post(config.api_url+'/user/'+owner+'/folder', commons.restParams({
      data: data
    }))
    .on('complete', function(r){
      isDone(r);
    });    
  });

  //Event strips out propeties that shouldnt be sent to the view from the 
  //files object
  register.once('stripOnFolder', function(data, isDone){
    //Remove unecessary properties and hash the ObjectId;
    //the pass it to the next event
    isDone(strip_folder_result(data));
  });

  register
  .queue('reqNewFolder', 'stripOnFolder')
  .onEnd(function(data){
    cb(data);
  })
  .onError(function(err){
    cb(err);
  })
  .start(dataTo);
};

/**
 * Send a request to query all files beloging to a user
 * regardless of what folder / subfolder the file is in.
 * @param  {[type]}   userId   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
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
  }).on('error', function(err){
    callback(err);
  });
};

K33per.prototype.getUserQueue = function(userId, callback){
  console.log('loading user queue...');
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

K33per.prototype.requestFileDownload = function(mediaId, redis_client, cb){
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


module.exports.K33per = K33per;

var k33per = new K33per();

module.exports.routes = function(app, redis_client){
  //Request all files in a folder belonging to a user
  //Using the req.query.id to determine what folder is 
  //'current'
  app.get('/api/internal/users/folder', function(req, res, next){
    var currentFolder;
    //The parent folder if any
    var parent = req.query.parent;

    //Users are always stored as hashes on the vault
    var owner = hashr.hashOid(req.session.passport.user);

    if (req.query.id === 'home') {
      //load home fetches the ObjectId of
      //the currently logged-in user's
      //home folder
      k33per.loadHome(owner, function(d){
        if(util.isError(d)){
          next(d);
        }else{
          //gotten the ObjectId...
          //lets load the folder files 
          k33per.loadFolder(owner, {
            id: d,
            parentId: parent
          }, function(r){
            if(util.isError(r)){
              next(r);
            }else{
              res.json(200, r);
            }
          });   

        }
      });        
    } else {
      currentFolder = hashr.unhashOid(req.query.id);

      k33per.loadFolder(owner, {
        id: currentFolder,
        parentId: parent
      }, function(r){
        if(util.isError(r)){
          next(r);
        }else{
          res.json(200, r);
        }
      });
    }
  });

  //Request all files uploaded by a user
  app.get('/api/internal/users/files', function(req, res, next){
    var owner = hashr.hashOid(req.session.passport.user);
    k33per.getUsersFiles(owner, function(r){
      if( r instanceof Error){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  app.get('/api/internal/users/queue', function(req, res, next){
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
  app.get('/api/internal/search/:queryString', function(req, res, next){
    k33per.search(req.params.queryString, function(r){
      if(util.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  app.get('/api/internal/media/:mediaId/request/', function(req, res, next){
    k33per.requestFileDownload(req.params.mediaId, redis_client, function(r){
      if(util.isError(r)){
        next(r);
      }else{
        res.redirect(r);
      }
    });
  });

  //calls the method which creates a new folder or subfolder
  app.post('/api/internal/users/folder', function(req, res, next){
    // return res.json(500, false);
    var owner = hashr.hashOid(req.session.passport.user);
    k33per.createFolder( req.body.name, req.body.parentId, req.body.type, owner, function(r){
      if(util.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  }); 

  //Update tags for a file
  app.put('/api/internal/users/files/:fileId/tags', function(req, res, next){
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


  app.del('/api/internal/users/files/:fileId', function(req, res, next){
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
  app.del('/api/internal/users/queue/:queueId', function(req, res, next){
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
