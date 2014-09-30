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

app.config(function ($stateProvider, $urlRouterProvider, flowFactoryProvider) {
  flowFactoryProvider.defaults = {
      target: '/upload',
      permanentErrors:[404, 500, 501]
  };
  // You can also set default events:
  flowFactoryProvider.on('filesAdded', function (files) {
    console.log(files);
  });
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
    }
  };
}]);

