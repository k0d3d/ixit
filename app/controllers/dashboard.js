/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    util = require('util'),
    _ = require('underscore'),
    Keeper = require('./k33per').keeper,
    hashr = require('../../lib/hash.js'),  
    commons = require('../../lib/commons'),
    passport = require("passport");


//Initialize Dashboard Object
function Dashboard (){

}

Dashboard.prototype.constructor = Dashboard;

Dashboard.prototype.getClientKey = function(userId, cb){
	User.findOne({
		_id: userId
	},'clientKey')
	.exec(function(err, i){
		if(err) return cb(new Error(err));
		cb(i.clientKey);
	});
};

var dashboard = new Dashboard();
module.exports.dashboard = dashboard;

module.exports.routes = function(app){
	app.get('/dashboard', function(req, res){
		res.render('dashboard');
	});

	app.get('/dashboard/developer', function(req, res){
		dashboard.getClientKey(req.session.passport.user, function(r){
			var key;
			if(util.isError(r) || _.isEmpty(r)){
				key = '';
			}else{
				key = r;
			}
			console.log(key);
			res.render('dashboard/developer', {
				key: key
			});			
		});
	});

	app.get('/dashboard/all', function(req, res){
		var keeper = new Keeper();
		var owner = hashr.hashOid(req.session.passport.user);
		keeper.count(owner, function(d){
			var r = (!_.isEmpty(d))? d[0]: {files: 0, size: 0};
			res.render('dashboard/all', {
				size: commons._formatFileSize(r.size),
				files: r.files
			});
		});
	});

	//Show All Files on the user dashboard
	app.get('/dashboard/files/all', passport.ensureAuthenticated, function(req, res){
		res.render('dashboard');
	});

	app.get('/dashboard/user/account', passport.ensureAuthenticated, function(req, res){
		res.render('dashboard');
	});

	app.get('/dashboard/user/developer', passport.ensureAuthenticated, function(req, res){
		res.render('dashboard');
	});

};