var app = angular.module('ixitApp',[
    'ui.router',
    'filters',
    'directives',
    'language',
    'user',
    'dashboard',
    'services',
    'ngResource',
    'ngSanitize',
    'ngCookies'
  ]);

app.config(function ($stateProvider, $urlRouterProvider, $httpProvider) {

  $urlRouterProvider.otherwise('/cabinet/files/all');
  // $urlRouterProvider.otherwise('/cabinet');
  //$locationProvider.html5Mode(true);
  $httpProvider.interceptors.push('errorNotifier');
});

app.factory('errorNotifier', ['$q', 'Alert', function($q, N) {
  return {
    responseError: function (response) {
      N.set_notice({
        message: response.data.message || response.data,
        type: 'danger'
      });
      return $q.reject(response);
    }
  };
}]);


app.controller('MainController', 
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

  //Initialize breadcrumbs 
  $scope.path = [];


  $scope.commons = {
    clearAll:  function _clearAll(){
      $scope.filequeue = '';
    }
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

  $scope.$on('reloadTab', function () {
    var index = _.findIndex($scope.cabinetTabs, {id: T.tab.id});
    console.log(index, T.tab);
    if (index < 0) {
      $scope.cabinetTabs.push(T.tab);
    } else {
      $scope.cabinetTabs[index] = T.tab;
    }
    
  });

  //Listener for prompts
  $scope.$on('newPrompt', function(){
    $scope.alerts = Alert.prompts;
  });
  //Listener for notifincation 
  $scope.$on('newNotice', function(){
    $scope.notices = Alert.notes;
  });

  $scope.$on('refresh_breadcrumb', function () {
    $scope.path = Keeper.path; 
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
 
 
