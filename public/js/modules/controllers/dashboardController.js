angular.module('dashboard',[
    'ngResource',
    'ngSanitize'
  ])
.config(['$routeProvider', function ($routeProvider){
    $routeProvider.when('/dashboard', {templateUrl: '/dashboard/all', controller: 'indexController'})
    .when('/dashboard/files/all', {templateUrl: '/dashboard/all', controller: 'indexController'});
  }])
.controller('indexController', ["$scope", "$http", "$cookies", function indexController($scope, $http, $cookies){
    
}])
.controller('filesController', ['$scope', '$http', 'Keeper', function filesController($scope, $http, Keeper){
    function init(){
        $scope.files = [];
        var param = {user: $scope.cuser};
        Keeper.thisUserFiles(param, function(r){
          if(r !== false){
            angular.forEach(r, function(value, key){
              $scope.files.push(value);
            });
          }
        });
    }
    init();

    $scope.trashFile = function(index){         
        var ixid = $scope.files[index].ixid;
        Keeper.deleteThisFile(ixid, function(did){
            $scope.files.splice(index, 1);
        });
    }
}])
.controller('queueController', ['$scope', '$http', 'Keeper', 'Sharer', function queueController($scope, $http, Keeper, Sharer){
    function init(){
        $scope.filequeue;
        var param = {user: $scope.cuser};
        Keeper.thisUserQueue(param, function(r){
            if(r !== false && !_.isEmpty(r)){
                _.each(r, function(v, i){
                    Sharer.queue(v);
                })
            }
        });
    }
    init();

    $scope.toggleUpload = function(){
        if(Sharer.resumable.isUploading()){
            $scope.uploadStateText = "Resume";
            $scope.uploadStateClass = "fa-play";
            Sharer.resumable.pause();
        }else{
            $scope.uploadStateText = "Pause";
            $scope.uploadStateClass = "fa-pause";
            Sharer.resumable.upload();
        }
        
    };


    //Cancels a given file on the 
    $scope.clear = function(e, mid, uid){
        e.preventDefault();
        if(!_.isUndefined(Sharer.resumable)){
            var fileObj = Sharer.resumable.getFromUniqueIdentifier(uid);
            fileObj.cancel();
        }
        Keeper.removeFromQueue(mid, function(){
            Sharer.removeFromQueue(uid);
        });          
    }

    //Cancels all uploads on the queue
    $scope.clearAll = function(){
        Sharer.resumable.cancel();
        Sharer.cancel();
    };

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

