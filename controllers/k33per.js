/**
 * Module dependencies.
 */
var
    rest = require('restler'),
    hashr = require('../lib/hash.js'),
    _ = require('lodash'),
    config = require('config'),
    commons = require('../lib/commons'),
    util = require('util'),
    errors = require('../lib/errors.js'),
    //redis = require('redis'),
    EventRegister = require('../lib/event_register').register;
    //redis_client = redis.createClient();

function strip_files_result(m){
  //if its an array use the map function to loop
  //over the process
  var omit = ['_id', 'chunkCount', 'progress', 'identifier', '__v', 'mediaNumber', 'folder'];
  try {
    if(util.isArray(m)){
      return _.map(m, function(v){

        return _.omit(v, omit);
      });
    }else{

      return _.omit(m, omit);
    }

  } catch (e) {
    console.log(e);
  }

}
function strip_folder_result(m){
  //If its an array
  var omit = ['_id', 'folderId', 'visible', '__v', 'id'];
  try {

    if(util.isArray(m)){
      return _.map(m, function(v){
        // var id = hashr.hashOid(v._id);
        // var n = _.omit(v, ['_id', 'folderId', 'visible', '__v']);
        // return _.extend({id: id}, n);

        return _.omit(v, omit);
      });
    }else{
      //Just one object
      // var id = hashr.hashOid(m._id);
      // var n = _.omit(m, ['_id', 'folderId', 'visible', '__v']);
      // return _.extend({id: id}, n);

      return _.omit(m, omit);
    }
  } catch (e) {
    console.log(e);
  }

}

function strip_queue_result(mongooseResult, callback){
  var h = {};
  _.each(mongooseResult, function(v, i){
    //var ixid = hashr.hashInt(v._id);
    var l = v.owner+'-';

    var n = _.omit(v, [
      '_id',
      // 'chunkCount',
      // 'progress',
      'visible',
      'downloadCount',
      '__v',
      'owner',
      'identifier',
      'completedDate',
      'id'
      ]);
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
  rest.get(config.dkeep_api_url+'/users/'+user+'/home', commons.restParams())
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
    rest.get(config.dkeep_api_url+'/users/'+user+'/folder?id='+options.id+'&parentId='+options.parentId, commons.restParams())
    .on('complete', function(r){
      cab.props = strip_folder_result(r.props);
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
    rest.post(config.dkeep_api_url+'/users/'+owner+'/folder', commons.restParams({
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
  rest.get(config.dkeep_api_url+'/users/'+userId+'/files', {
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
  }).on('success', function(data, response){
    if(_.isEmpty(data)){
      return callback({}, response);
    }

    //Remove unecessary properties and has the mongooseid;
    // strip_files_result(data, function(r){
    //   console.log(r);
    // });
    callback(strip_files_result(data), response);

  }).on('error', function(err){
    callback(err);
  });
};

K33per.prototype.getUserQueue = function(userId, callback){
  console.log('loading user queue...');
  rest.get(config.dkeep_api_url+ '/users/'+userId+'/queue',{
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
  }).on('success', function(data, response){
    if(_.isEmpty(data)){
      return callback({}, response);
    }
    //Remove unecessary propertied and has the mongooseid;
    // console.log(data);
    strip_queue_result(data, function(r){
      callback(r, response);
    });
  }).on('error', function(err){
    callback(err);
  });
};

K33per.prototype.deleteUserFile = function(userId, fileId, callback){
  if (!commons.testIfObjId(fileId)) {
    fileId = hashr.unhashInt(fileId);
  }
  rest.del(config.dkeep_api_url+'/users/'+userId+'/file/'+fileId,{
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
  }).on('success', function(result, response){
    callback(result, response);
  }).on('error', function(err){
    callback(err);
  });
};


K33per.prototype.deleteUserFolder = function deleteFolder (userId, folderId, cb) {
  // body...
  rest.del(config.dkeep_api_url+'/users/'+userId+'/folder/' + folderId, commons.restParams())
  .on('success', function(data){
    cb(data);
  })
  .on('fail', function(err){
    cb(errors.nounce(err.error));
  });
};

K33per.prototype.removeUserQueue = function(mediaNumber, owner, cb){
  rest.del(config.dkeep_api_url+'/users/'+owner+'/queue/'+mediaNumber, {
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
  }).on('success', function(result){
    cb(result);
  }).on('fail', function(err){
    cb(errors.nounce(err.error));
  });
};

K33per.prototype.updateTags = function(file_id, owner, tags, cb){
  var fileId = hashr.unhashInt(file_id);
  rest.put(config.dkeep_api_url+'/users/'+owner+'/file/'+fileId+'/tags', {
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent },
    data: {tags: tags}
  })
  .on('success', function(result){
    cb(result);
  })
  .on('fail', function(err){
    cb(errors.nounce(err.error));
  });
};


K33per.prototype.search = function(query, cb){
  rest.get(config.dkeep_api_url+'/media/search/'+query,{
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
  })
  .on('success', function(result){
    cb(result);
  })
  .on('fail', function(err){
    cb(errors.nounce(err.error));
  });
};

K33per.prototype.downloadPage = function(mediaId, cb){
  //return cb(true);
  rest.get(config.dkeep_api_url+'/users/media/'+mediaId,{
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
      cb(config.dkeep_api_url+'/download/'+reply.toString());
    }
  });
};

K33per.prototype.requestSignedUrl = function(mediaId, token, cb){
  mediaId = hashr.unhashInt(mediaId);
  rest.get(config.dkeep_api_url+'/users/media/'+ mediaId + '/uri',{
    headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
  })
  .on('complete', function(rz, rs){
    if (rs instanceof Error) {
      return cb(rs);
    } else {
      return cb(rz);
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
  rest.get(config.dkeep_api_url+'/users/'+userId+'/media/count', commons.restParams())
  .on('complete', function(data){
    cb(data);
  });
};


module.exports.K33per = K33per;

var k33per = new K33per();

module.exports.routes = function(app, redis_client, isLoggedIn){
  //Request all files in a folder belonging to a user
  //Using the req.query.id to determine what folder is
  //'current'
  app.get('/api/:apiVersion/users/folder', function(req, res, next){
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
  app.get('/api/:apiVersion/users/files', function(req, res, next){
    var owner = req.user._id;
    // var owner = hashr.hashOid(req.user._id);
    k33per.getUsersFiles(owner, function(r){
      if( r instanceof Error){
        next(r);
      }else{
        res.status(200).json(r);
      }
    });
  });

  app.get('/api/:apiVersion/users/queue', function(req, res, next){
    // var owner = hashr.hashOid(req.session.passport.user);
    var owner = req.user._id;
    k33per.getUserQueue(owner, function(r){
      if( r instanceof Error){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });
  //Searches for files using filenames and tags
  app.get('/api/:apiVersion/search/:queryString', function(req, res, next){
    var owner = req.user._id;
    k33per.search(req.params.queryString, function(r){
      if(util.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  app.get('/api/:apiVersion/media/:mediaId/request/', function(req, res, next){
    k33per.requestFileDownload(req.params.mediaId, redis_client, function(r){
      if(util.isError(r)){
        next(r);
      }else{
        res.redirect(r);
      }
    });
  });


  app.get('/api/:apiVersion/media/:mediaId/uri', function(req, res, next){
    console.log('here in uri');
    k33per.requestSignedUrl(req.params.mediaId, redis_client, function(r){
      if(util.isError(r)){
        next(r);
      }else{
        res.status(200).json(r);
      }
    });
  });

  //calls the method which creates a new folder or subfolder
  app.post('/api/:apiVersion/users/folder', function(req, res, next){
    // return res.json(500, false);
    var owner = req.user._id;
    k33per.createFolder( req.body.name, req.body.parentId, req.body.type, owner, function(r){
      if(util.isError(r)){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  //Update tags for a file
  app.put('/api/:apiVersion/users/files/:fileId/tags', function(req, res, next){
    var tags = req.body.tags;
    var file_id = req.params.fileId;
    // var owner = hashr.hashOid(req.session.passport.user);
    var owner = req.user._id;
    k33per.updateTags(file_id, owner, tags, function(d){
      if(util.isError(d)){
        next(d);
      }else{
        res.json(200, d);
      }
    });
  });


  app.delete('/api/:apiVersion/users/files/:fileId', function(req, res, next){
    var owner = req.user._id;
    // var owner = hashr.hashOid(req.session.passport.user);
    var file = req.params.fileId;
    k33per.deleteUserFile(owner, file, function(r){
      if( r instanceof Error){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  app.delete('/api/:apiVersion/users/folder/:folderId', function(req, res, next){
    var owner = req.user._id;
    // var owner = hashr.hashOid(req.session.passport.user);
    var folderId = req.params.folderId;
    k33per.deleteUserFolder(owner, folderId, function(r){
      console.log(r);
      if( r instanceof Error){
        next(r);
      }else{
        res.json(200, r);
      }
    });
  });

  //Delete a file on the upload queue
  app.delete('/api/:apiVersion/users/queue/:queueId', function(req, res, next){
    var owner = req.user._id;
    // var owner = hashr.hashOid(req.session.passport.user);
    var mediaNumber = req.params.queueId;
    k33per.removeUserQueue(mediaNumber, owner, function(r){
      if( r instanceof Error){
        next(r);
      }else{
        res.json(200, r);
      }   });
  });
}
