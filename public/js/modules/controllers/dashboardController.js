    angular.module('dashboard',[
        'ngResource',
        'ngSanitize'])
    
    .config(['$routeProvider', function ($routeProvider){
        $routeProvider.when('/dashboard', {templateUrl: '/dashboard/index', controller: 'indexController'})
        .when('/dashboard/files/all', {templateUrl: '/dashboard/all', controller: 'indexController'});
    }])
    .controller('indexController', function indexController($scope, $http){

    })