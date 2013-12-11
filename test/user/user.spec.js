/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    restler = require("restler");

describe('Login Process :', function() {
    var completed, userId,
        formData = {
            email: 'tests@ixit.vm',
            password: 'password'
        },
        result,
        seesurfToken = '';
    var baseUrl = 'http://localhost';

    beforeEach(function(){
        completed = false;
        result = '';
    });

    it("should set SeeSurf Headers", function(){
        runs(function(){
            restler.get(baseUrl).on("complete", function(data, response){
                //seesurfToken = /XSRF-TOKEN=(.*?);/.exec(response.headers['set-cookie'])[1] || '';
                result = response.statusCode;
                completed = true;
            });
        });

        waitsFor(function(){
            return completed;
        });

        runs(function(){
            console.log('SeeSurf: %s, StatusCode: %s', seesurfToken, result);
            expect(result).toEqual(200);
            //expect(seesurfToken.length).toBeGreaterThan(0);
        });
    });
 


    xit("should attempt to login", function(){
        runs(function(){
            setTimeout(function(){
                completed = true;
            }, 5000);
            // restler.post(baseUrl+'/api/users/sessions').on('complete', function(data, response){
            //     //result = response.statusCode;
            //     completed = true;
            // });
        });

        waitsFor(function(){
            return completed;
        });

        runs(function(){
            console.log(result);
            expect(4).toEqual(200);
        });
    });
});

describe("User parole", function(){
    it('should load a profile photo for a user', function(){

    });
})