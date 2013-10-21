    angular.module('ixitApp',[
        'filters',
        'directives',
        'home',
        'user',
        'dashboard',
        'ngResource',
        'ngSanitize',
        'ngCookies'
        ]);
    angular.module('ixitApp').config(function ($routeProvider, $locationProvider) {
      $routeProvider.
        otherwise({
          redirectTo: '/'
        });
      $locationProvider.html5Mode(true);
    });
    angular.module('ixitApp').controller('MainController', function($scope, $http, $location){
      $scope.modal ={
        heading : '',
        body : ''
      };

      $scope.filequeue = [];

      function href(target){
        $location.path(target);
      }
      function backBtn(){
        history.back();
      }
      function _clearAll(){
        $scope.filequeue = '';
      }
      $scope.commons = {
        href : href,
        backBtn: backBtn,
        clearAll: _clearAll
      };
      $scope.clickBrowse = function(){
          $('.browsefiles').click();
      };
    });

 
