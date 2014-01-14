describe("Event Register", function(){

	var EventRegister = require('../lib/event_register').register;
	var complete, result;

	beforeEach(function(){
		complete = false;
	});

	xit("should correctly queue events", function(){
		var eventRegister = new EventRegister();

		eventRegister.on('say', function(data, isDone){
			console.log('Say: %s',data);
			isDone(++data);
		});
		eventRegister.on('no', function(data, isDone){
			isDone(++data);
		});
		eventRegister.on('Ayy', function(data, isDone){
			isDone(++data);
		});
	
		eventRegister.on('Bee', function(data, isDone){
			isDone(++data);
		});
	
		eventRegister.on('Cee', function(data, isDone){
			isDone(++data);
		});

		eventRegister.on('complete', function(data, isDone){
			console.log('complete spoken');
			complete = true;
		});


		runs(function(){
			eventRegister
			.queue('Ayy', 'Bee', 'Cee')
			.beforeEach('say')
			.afterEach('no')
			.onEnd(function(r){
				result = r;
				complete = true;
			})
			.start(1);

		});

		waitsFor(function(){
			return complete;
		});

		runs(function(){
			expect(result).toBeDefined();
			expect(result).toEqual(9);
		});
	});
	xit("should stop the queue when an event occurs", function(){
		var eventRegister = new EventRegister();

		eventRegister.on('say', function(data, isDone){
			console.log('Say: %s',data);
			isDone(++data);
		});
		eventRegister.on('no', function(data, isDone){
			isDone(++data);
		});
		eventRegister.on('Ayy', function(data, isDone){
			isDone(new Error('Ayy throws error'));
		});
	
		eventRegister.on('Bee', function(data, isDone){
			isDone(++data);
		});
	
		eventRegister.on('Cee', function(data, isDone){
			isDone(++data);
		});

		eventRegister.on('complete', function(data, isDone){
			console.log('complete spoken');
			complete = true;
		});


		runs(function(){
			eventRegister
			.queue('Ayy', 'Bee', 'Cee')
			.beforeEach('say')
			.afterEach('no')
			.onError(function(err){
				console.log(err);
				result = err;
				complete = true;
			})
			.onEnd(function(r){
				result = r;
				complete = true;
			})
			.start(1);

		});

		waitsFor(function(){
			return complete;
		});

		runs(function(){
			expect(result).toBeDefined();
		});
	});
	it("should throw an error when it finds missing listners", function(){
		var eventRegister = new EventRegister();

		eventRegister.on('say', function(data, isDone){
			console.log('Say: %s',data);
			isDone(++data);
		});
		eventRegister.on('no', function(data, isDone){
			isDone(++data);
		});
		eventRegister.on('Ayy', function(data, isDone){
			isDone(new Error('Ayy throws error'));
		});
	
		eventRegister.on('Bee', function(data, isDone){
			isDone(++data);
		});
	
		eventRegister.on('Cee', function(data, isDone){
			isDone(++data);
		});

		eventRegister.on('error', function(data, isDone){
			console.log('complete spoken');
			complete = true;
		});


		runs(function(){
			eventRegister
			.queue('Ayy', 'Bee', 'Cee')
			.beforeEach('say')
			.afterEach('no')
			// .onError(function(err){
			// 	console.log(err);
			// 	result = err;
			// 	complete = true;
			// })
			.onEnd(function(r){
				result = r;
				complete = true;
			})
			.start(1);

		});

		waitsFor(function(){
			return complete;
		});

		runs(function(){
			expect(result).toBeDefined();
		});
	});

});