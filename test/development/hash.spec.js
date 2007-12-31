describe("Hashids shebang", function(){
	var hashr = require("../lib/hash.js");
	var oid = "52640da7e4c5b82b07000001";
	var i = 900001;
	var str = "757575"
	var result = {};
	it("should hash a hex mongoose object id", function(){
		result.hex = hashr.hashOid(oid);
		expect(result.hex).toBeDefined();
		expect(result.hex.length).toBeGreaterThan(0);
	});

	it("should convert a hex hash back to a mongoose object ID", function(){
		var l = hashr.unhashOid(result.hex);
		expect(l).toBeDefined();
		expect(l).toEqual(oid);
	});

	it("should hash an integer to 8 char ", function(){
		result.hashedint = hashr.hashInt(i);
		expect(result.hashedint).toBeDefined();
		expect(result.hashedint.length).toEqual(8);
	});

	it("should cast the string to int, just incase", function(){
		result.hashedstr = hashr.hashInt(str);
		expect(result.hashedstr).toBeDefined();
		expect(result.hashedstr.length).toEqual(8);
	});

	it("should convert a 8char hash back to an int", function(){
		var l = hashr.unhashInt(result.hashedint);
		expect(l).toBeDefined();
		expect(l).toEqual(i);
	});
});