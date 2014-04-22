/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    restler = require("restler");

//The tests
describe('<Routes Test>', function() {
    var baseUrl = 'http://localhost';
    describe('Public Routes :', function() {
        var completed = false, result;
        it("200 ok for 'home' Routes", function(){
            runs(function(){
                restler.get(baseUrl).on('complete', function(data, response){
                    result = response.statusCode;
                    completed = true;
                });
            });

            waitsFor(function(){
                return completed;
            });

            runs(function(){
                expect(result).toEqual(200);
            });

        });

        it("200 ok for 'login' route", function(){
            runs(function(){
                restler.get(baseUrl+'/login').on('complete', function(data, response){
                    result = response.statusCode;
                    completed = true;
                });
            });

            waitsFor(function(){
                return completed;
            });

            runs(function(){
                expect(result).toEqual(200);
            });
        });
        it("200 ok for 'register' route", function(){
            runs(function(){
                restler.get(baseUrl+'/register').on('complete', function(data, response){
                    result = response.statusCode;
                    completed = true;
                });
            });

            waitsFor(function(){
                return completed;
            });

            runs(function(){
                expect(result).toEqual(200);
            });
        });      

    });
});