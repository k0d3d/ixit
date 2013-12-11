angular.module('ixitApp',[
    'filters',
    'directives',
    'language',
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
angular.module('ixitApp')
  .controller('MainController', 
    [ '$scope', 
      '$http', 
      '$location', 
      '$rootScope', 
      '$cookies', 
      function($scope, $http, $location, $rootScope, $cookies){
    
  $scope.cuser = $cookies.throne;

  $scope.modal ={
    heading : '',
    body : ''
  };

  $rootScope.completedUploads = 0;

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
  
}]);

 
