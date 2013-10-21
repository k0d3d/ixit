    angular.module('dashboard',[
        'ngResource',
        'ngSanitize'])
    
    .config(['$routeProvider', function ($routeProvider){
        $routeProvider.when('/dashboard', {templateUrl: '/dashboard/all', controller: 'indexController'})
        .when('/dashboard/files/all', {templateUrl: '/dashboard/all', controller: 'indexController'});
    }])
    .controller('indexController', function indexController($scope, $http){

    })
    .controller('filesController', function filesController($scope, $http, Keeper){
        function init(){
            $scope.files = [];
            var param = {user: 'januzaj'};
            Keeper.thisUserFiles(param, function(r){
                if(r !== false){
                    $scope.files = r;
                }
            });
        }
        init();
    })
    .controller('queueController', ['$scope', '$http', 'Keeper', 'Sharer', function queueController($scope, $http, Keeper, Sharer){
        function init(){
            $scope.filequeue;
            var param = {user: 'januzaj'};
            Keeper.thisUserQueue(param, function(r){
                if(r !== false){
                    Sharer.queue(r);
                }
            });
        }
        init();

        $scope.$on('onQueue', function(){
            $scope.filequeue = Sharer.filequeue;
        });
    }]).
    filter('formatFileSize', function(){
        return function(bytes){
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
        }
    })
    .filter('moment', function(){
        return function(time){
            var m = moment(time);
            return m.fromNow();
        }
    });

