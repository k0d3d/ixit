    angular.module('ixitApp',[
        'filters',
        'directives',
        'home',
        'user',
        //'files'
        'ngResource',
        'ngSanitize'
        ]);
    angular.module('ixitApp').config(function ($routeProvider, $locationProvider) {
      $routeProvider.
        otherwise({
          redirectTo: '/'
        });
      $locationProvider.html5Mode(true);
    });
    angular.module('ixitApp').controller('MainController', function($scope, $http){
      $scope.modal ={
        heading : '',
        body : ''
      };

      $scope.arhref = function(arhrefVal){
        window.location.href=arhrefVal;
      };
    });

 
