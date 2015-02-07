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
    simultaneousUploads: 1,
    permanentErrors:[500, 501],
    // maxChunkRetries: 1,
    chunkRetryInterval: 2000

  };
  // You can also set default events:
  flowFactoryProvider.on('fileSuccess', function (file, message) {
    if (message.indexOf('ixid') < 0) {
      file.error = true;
      return false;
    }
    var o = JSON.parse(message);
    file.ixid = o.ixid;
  });

  // You can also set default events:
  flowFactoryProvider.on('fileError', function (file) {
    file.status = 'Retry now';
  });
  // You can also set default events:
  flowFactoryProvider.on('fileRetry', function (file) {
    file.status = 'retrying...';
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
    '$timeout',
    '$interval',
    function($scope, $http, $location, $rootScope, $cookies, $timeout, $interval){

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

  $scope.$on('flow::fileError', function (event, flow, file) {
    file.retryInterval = 5;
    var retryInterval = $interval(function () {
      --file.retryInterval;
    }, 1000);

    var retryUpload = $timeout(function() {
      file.retry();
      $interval.cancel(retryInterval);
    }, 5000);

    $scope.$on(
      "$destroy",
      function() {
        console.log('timeout cleaned');
        $timeout.cancel(retryUpload);
      }
    );
  });

  $scope.$on('flow::fileRetry', function (e, flow, file) {

  });

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

