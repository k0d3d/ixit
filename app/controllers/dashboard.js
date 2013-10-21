/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require("passport");


//Initialize Dashboard Object
function Dashboard (){

}

Dashboard.prototype.constructor = Dashboard;


module.exports.routes = function(app){
	app.get('/dashboard', function(req, res){
		res.render('dashboard');
	});

	//Show All Files on the user dashboard
	app.get('/dashboard/files/all', function(req, res){
		res.render('dashboard');
	});

};


var dashboard = new Dashboard();
module.exports.dashboard = dashboard;