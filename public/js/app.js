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
    'ngCookies',
    'flow'
  ]);
// app.run(function($http, $cookies) {
//   $http.defaults.headers.common.ixAuthr = $cookies.throne;
// });
app.config([
  '$stateProvider', 
  '$urlRouterProvider', 
  '$httpProvider', 
  'flowFactoryProvider', 
  '$cookiesProvider',
  function ($stateProvider, $urlRouterProvider, $httpProvider, flowFactoryProvider, $cookies) {
  flowFactoryProvider.defaults = {
      target:'http://localhost:3001/upload',
      chunkSize:1*1024*1024,
      simultaneousUploads:4,
      testChunks:true,
      maxFiles: 10,
      // query: function queryParams (fileObj, chunkObj){
      //   return {
      //     fileType : fileObj.file.type.length > 0 ? fileObj.file.type : 'noMime',
      //     // throne: Keeper.currentUser
      //   };
      // },
      permanentErrors:[404, 500, 501],
      maxChunkRetries: 1,
      chunkRetryInterval: 5000,      
  };
  // You can also set default events:
  flowFactoryProvider.on('progress', function (event) {
    // ...
    // console.log('progress', arguments);
  });
    // Can be used with different implementations of Flow.js
    // flowFactoryProvider.factory = fustyFlowFactory;  
  $urlRouterProvider.otherwise('/cabinet/files/all');
  //$locationProvider.html5Mode(true);
  // $httpProvider.interceptors.push('errorNotifier');
  $httpProvider.interceptors.push('httpRequestInterceptor');
}]);

// app.factory('errorNotifier', ['$q', 'Alert', function($q, N) {
//   return {
//     responseError: function (response) {
//       N.set_notice({
//         message: response.data.message || response.data,
//         type: 'danger'
//       });
//       return $q.reject(response);
//     }
//   };
// }]);
app.factory('httpRequestInterceptor', [
  '$cookies', 
  '$window', 
  '$q', 
  'Alert',
  function($cookies, $window, $q, N) {
    return {
        request: function($config) {
            $config.headers['x-Authr'] =  $cookies.throne;
            return $config;
        },
        responseError: function (response) {
          if(response.status === 401) {
              $window.location.href = '/#/login';
              return $q.reject(response);
          }
          else {
            N.set_notice({
              message: response.data.message || response.data,
              type: 'danger'
            });
            return $q.reject(response);
          }          
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

  // $rootScope.completedUploads = 0;

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

  $scope.$on('folder_change', function () {
    console.log('folder chamhged');
    $scope.currentFolder = Keeper.currentFolder; 
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
 
 
