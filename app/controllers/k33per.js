/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require("passport"),
    rest = require("restler"),
    HashID = require("hashids"),
    api_url = "http://localhost:3000",
    config = require("../../config/config"),
    util = require("util");

// K33per Object
function K33per (){

}

K33per.prototype.constructor = K33per;

K33per.getUsersFiles = function(userId, callback){
	rest.get(api_url+'/user/'+userId+'/files', {
		headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
	}).on('complete', function(result, response){
		callback(result, response);
	});
};

K33per.getUserQueue = function(userId, callback){
	rest.get(api_url+ '/user/'+userId+'/queue',{
		headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
	}).on('complete', function(result, response){
		callback(result, response);
	});
};

K33per.deleteUserFile = function(userId, fileId, callback){
	rest.del(api_url+'/user/'+userId+'/file/'+fileId,{
		headers: { 'Accept': '*/*', 'User-Agent': config.app.user_agent }
	}).on('complete', function(result, response){
		callback(result, response);
	});
};

module.exports.keeper = K33per;

module.exports.routes = function(app){
	app.get("/api/user/files", function(req, res, next){
		var owner = req.body.throne || 'januzaj';
		K33per.getUsersFiles(owner, function(r){
			if( r instanceof Error){
				util.puts(r.message);
				res.json(400, {});
			}else{
				res.json(200, r);
			}			
		});
	});

	app.get("/api/user/queue", function(req, res, next){
		var owner = req.body.throne || 'januzaj';
		K33per.getUserQueue(owner, function(r){
			if( r instanceof Error){
				util.puts(r.message);
				res.json(400, {});
			}else{
				res.json(200, r);
			}
		});
	});

	app.delete("/api/user/file", function(req, res, next){
		var owner = req.body.throne || 'januzaj';
		var file = req.body.mediaId;
		K33per.deleteUserFile(owner, file, function(r){
			if( r instanceof Error){
				util.puts(r.message);
				res.json(400, {});
			}else{
				res.json(200, r);
			}			
		});
	});
}
