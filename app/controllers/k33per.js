/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport'),
    rest = require('restler'),
    hashr = require('../../lib/hash.js'),
    _ = require('underscore'),
    api_url = 'http://localhost:3000',
    config = require('../../config/config'),
    util = require('util');

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

K33per.getUsersFiles = function(userId, callback){
	rest.get(api_url+'/user/'+userId+'/files', {
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

K33per.getUserQueue = function(userId, callback){
	rest.get(api_url+ '/user/'+userId+'/queue',{
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

K33per.deleteUserFile = function(userId, fileId, callback){
	fileId = hashr.unhashInt(fileId);
	rest.del(api_url+'/user/'+userId+'/file/'+fileId,{
		headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
	}).on('success', function(result, response){
		callback(result, response);
	}).on('error', function(err){
		callback(err);
	});
};

K33per.removeUserQueue = function(mediaNumber, owner, callback){
	rest.del(api_url+'/user/'+owner+'/queue/'+mediaNumber, {
		headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
	}).on('success', function(result){
		callback(result);
	}).on('error', function(err){
		callback(err);
	});
};

K33per.updateTags = function(file_id, owner, tags, cb){
	var fileId = hashr.unhashInt(file_id);
	rest.put(api_url+'/user/'+owner+'/file/'+fileId+'/tags', {
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

module.exports.keeper = K33per;

module.exports.routes = function(app){
	app.get('/api/user/files', function(req, res, next){
		var owner = hashr.hashOid(req.session.passport.user);
		K33per.getUsersFiles(owner, function(r){
			if( r instanceof Error){
				next(r.message);
			}else{
				res.json(200, r);
			}
		});
	});

	app.get('/api/user/queue', function(req, res, next){
		var owner = hashr.hashOid(req.session.passport.user);
		K33per.getUserQueue(owner, function(r){
			if( r instanceof Error){
				next(r.message);
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
		K33per.updateTags(file_id, owner, tags, function(d){
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
		K33per.deleteUserFile(owner, file, function(r){
			if( r instanceof Error){
				next(r.message);
			}else{
				res.json(200, r);
			}
		});
	});

	//Delete a file on the upload queue
	app.del('/api/user/queue/:queueId', function(req, res, next){
		var owner = hashr.hashOid(req.session.passport.user); 
		var mediaNumber = req.params.queueId;
		K33per.removeUserQueue(mediaNumber, owner, function(r){
			if( r instanceof Error){
				next(r.message);
			}else{
				res.json(200, r);
			}		});
	});
}
