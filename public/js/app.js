angular.module('ixitApp',[
    'filters',
    'directives',
    'language',
    'home',
    'user',
    'dashboard',
    'services',
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
    'Keeper',
    'Tabs',
    'Alert',
    function($scope, $http, $location, $rootScope, $cookies, Keeper, T, Alert){
    
  $scope.cuser = $cookies.throne;

  $scope.modal ={
    heading : '',
    body : ''
  };

  $scope.cabinetTabs = [];

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
  $scope.searchQuery = function(){
    Keeper.search($scope.queryString, function(d){
      T.createTab({
        title: $scope.queryString,
        id: $scope.queryString.replace(/[^\w\s]/gi, '')+'-tab',
        list: d.hits
      });
    });
  };

  $scope.$on('newTab', function(){
    $scope.cabinetTabs.push(T.tab);
  });
  //Listener for prompts
  $scope.$on('newPrompt', function(){
    $scope.alerts = Alert.prompts;
  });
  //Listener for notifincation 
  $scope.$on('newNotice', function(){
    $scope.notices = Alert.notes;
  });

  // When the scope is destroyed, be sure to unbind
  // event handler can cause issues.
  $scope.$on(
    "$destroy",
    function() {
      $( window ).off( "resize.bnViewport" );
    }
  );

}]);
 
 
