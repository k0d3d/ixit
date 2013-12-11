describe("Keeper Shebang", function(){
	var UserModel = require("../app/models/user.js");
	var keeper = require("../app/controllers/k33per").keeper;
	var usrId = 'januzaj';
	var completed, result;
	beforeEach(function(){
		completed = false;
		result = {};
	});
	it("should successfully request the user files", function(){
		runs(function(){
			keeper.getUsersFiles(usrId, function(r, response){
				result.files = r[0];
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

	xit("should successfully request for the user's upload queue", function(){
		runs(function(){
			keeper.getUserQueue(usrId, function(r, response){
				result.queue = r[0];
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

	xit("should perform hashing and removing sensitive object properties from files request using strip_files_result", function(){
		console.log(result);
		expect(result.files._id).toBeUndefined();
		expect(result.files.chunkCount).toBeUndefined();
		expect(result.files.progress).toBeUndefined();
		expect(result.files.identifier).toBeUndefined();
		expect(result.files.__v).toBeUndefined();
		expect(result.files.ixid).toBeDefined();
		expect(result.files.ixid.length).toEqual(8);
	})
})