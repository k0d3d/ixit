//services.js
angular.module('ixitApp')
    .factory('Authenticate', function($http){
        var a = {};

        a.postParam = function(loginParams, callback){
            $http.post('/api/users/session', loginParams)
            .success(callback)
            .error(callback);
        };

        return a;
    });