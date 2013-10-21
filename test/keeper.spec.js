describe("Keeper Shebang", function(){
	var UserModel = require("../app/models/user.js");
	var keeper = require("../app/controllers/k33per").keeper;
	console.log(keeper);
	var usrId = 'januzaj';
	var completed, result;
	beforeEach(function(){
		completed = false;
		result = {};
	});
	it("should successfully request the user files", function(){
		runs(function(){
			keeper.getUsersFiles(usrId, function(r, response){
				result.data = r;
				result.status = response.statusCode;
				completed = true;
			})
		});
		waitsFor(function(){
			return completed;
		});
		runs(function(){
			expect(result.status).toEqual(200);
		});
	});

	it("should successfully request for the user's upload queue", function(){
		runs(function(){
			keeper.getUsersQueue(usrId, function(r, response){
				result.data = r;
				result.status = response.statusCode;
				completed = true;
			})
		});
		waitsFor(function(){
			return completed;
		});
		runs(function(){
			expect(result.status).toEqual(200);
		});		
	})
})