/**
 * Module dependencies.
 */
var User = require('../models/user.js'),
    util = require('util'),
    _ = require('underscore'),
    Keeper = require('./k33per').K33per,
    hashr = require('../lib/hash.js'),  
    commons = require('../lib/commons');

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

module.exports.routes = function(app, isLoggedIn, passport){
	  //Dashboard
  app.all('/dash/*', isLoggedIn(), function (req, res, next) {
    res.cookie('throne',hashr.hashOid(req.session.passport.user), {maxAge: 24 * 60 * 60 * 1000, httpOnly: false});
    console.log('yes is');
    return next(); 
  });

	app.get('/dash', isLoggedIn(), function(req, res){
		// var keeper = new Keeper();
		// var owner = hashr.hashOid(req.session.passport.user);
		res.cookie('throne', hashr.hashOid(req.session.passport.user), {maxAge: 24 * 60 * 60 * 1000, httpOnly: false});		
		res.locals.current_user = hashr.hashOid(req.session.passport.user);
		res.render('dashboard');		
		// keeper.loadHome(owner, function(d){
		// 	res.cookie('throne', hashr.hashOid(req.session.passport.user), {maxAge: 24 * 60 * 60 * 1000, httpOnly: false});
		// 	res.render('dashboard', {
		// 		home_folder: hashr.hashOid(d)
		// 	});
		// });		
	});

	// app.get('/dashboard/developer', function(req, res){
	// 	dashboard.getClientKey(req.session.passport.user, function(r){
	// 		var key;
	// 		if(util.isError(r) || _.isEmpty(r)){
	// 			key = '';
	// 		}else{
	// 			key = r;
	// 		}
	// 		res.render('dashboard/developer', {
	// 			key: key
	// 		});			
	// 	});
	// });

	app.get('/cabinet/files/all', isLoggedIn(), function(req, res){
		var keeper = new Keeper();
		var owner = hashr.hashOid(req.session.passport.user);
		keeper.count(owner, function(d){
			var r = (!_.isEmpty(d))? d[0]: {files: 0, size: 0};
			res.render('dashboard/all', {
				// size: commons._formatFileSize(r.size),
				// files: r.files
			});
		});
	});

};