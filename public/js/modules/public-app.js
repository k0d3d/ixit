var app = angular.module('ixitApp',[
    'ui.router',
    'flow',
    // 'filters',
    // 'directives',
    'language',
    'home',
    'user',
    // 'dashboard',
    'services',
    //'ngResource',
    'ngSanitize',
    'ngCookies',
    'Orbicular'
  ]);

app.config(function ($stateProvider, $urlRouterProvider, flowFactoryProvider, $httpProvider) {
  flowFactoryProvider.defaults = {
    target: 'http://127.0.0.1:3001/upload',
    permanentErrors:[404, 500, 501]
  };
  // You can also set default events:
  flowFactoryProvider.on('filesAdded', function (files) {

  });
  $urlRouterProvider.otherwise('/home');
  //$locationProvider.html5Mode(true);
  $httpProvider.interceptors.push('httpInterceptor');

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

app.factory('httpInterceptor', ['$rootScope', function ($rootScope) {
  return {
    'response' : function (response) {
      $rootScope.dkeepToken = response.headers()['dkeep-agent-id-token'];
      return response;
    }
  };
}]);

app.directive('dndevts', ['$document', function($document) {
    return {
      compile: function(element, attrs) {
        $($document).on('dragover dragenter', element, function (e) {
          e.preventDefault();
          $('.drag-notice-element').addClass('drag-hover');
        });

        $($document).on('dragleave', element, function (e) {
          e.preventDefault();
          $('.drag-notice-element').removeClass('drag-hover');
        });

        $($document).on('drop', element, function (e) {
          e.preventDefault();
          $('.drag-notice-element').removeClass('drag-hover');
        });
      }
    };
  }]);

app.directive('uploadListItem', [function () {

  return {
    link: function (scope, ele, attrs) {

    },
    templateUrl: 'templates/li_upload_item',
    controller: function ($scope) {
      $scope.pauseOrResume = function (file) {
        if (file.isUploading()) {
          return file.pause();
        } else {
          if (file.isComplete()) {
            return false;
          } else {
            return file.resume();
          }
        }
      };
      $scope._formatFileSize = function (bytes) {
        if (typeof bytes !== 'number') {
          return '';
        }
        if (bytes >= 1000000000) {
          return (bytes / 1000000000).toFixed(2) + ' GB';
        }
        if (bytes >= 1000000) {
          return (bytes / 1000000).toFixed(2) + ' MB';
        }
        return (bytes / 1000).toFixed(2) + ' KB';
      };
    $scope._formatBitrate = function (bits) {
      if (typeof bits !== 'number') {
        return '';
      }
      if (bits >= 1000000000) {
        return (bits / 1000000000).toFixed(2) + ' Gbit/s';
      }
      if (bits >= 1000000) {
        return (bits / 1000000).toFixed(2) + ' Mbit/s';
      }
      if (bits >= 1000) {
        return (bits / 1000).toFixed(2) + ' kbit/s';
      }
      return bits.toFixed(2) + ' bit/s';
    };
    }
  };
}]);

