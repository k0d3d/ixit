/**
 * Home Module
 */
angular.module('home',[])

.config(['$stateProvider', function ($stateProvider){
    $stateProvider
    .state('home', {
        url: '/home',
        templateUrl: '/home/index', 
        controller: 'homeIndexController'
    });
}])

.controller('homeIndexController', function(){

});

