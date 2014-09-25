var app = angular.module('ixitApp',[
    'ui.router',
    // 'filters',
    // 'directives',
    'language',
    'home',
    'user',
    // 'dashboard',
    'services',
    //'ngResource',
    'ngSanitize',
    'ngCookies'
  ]);

app.config(function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/home');
  //$locationProvider.html5Mode(true);

});


app.controller('MainController', 
  [ '$scope',
    '$http',
    '$location',
    '$rootScope',
    '$cookies',
    function($scope, $http, $location, $rootScope, $cookies){
    
  $scope.cuser = $cookies.throne;

  $scope.clickBrowse = function(){
    $('.browsefiles').click();
  };


  // When the scope is destroyed, be sure to unbind
  // event handler can cause issues.
  $scope.$on(
    "$destroy",
    function() {
      $( window ).off( "resize.bnViewport" );
    }
  );

}]);
 
 
