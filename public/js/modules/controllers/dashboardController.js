angular.module('dashboard',[
  'ngResource',
  'ngSanitize'
  ])
.config(['$routeProvider', function ($routeProvider){
  $routeProvider.when('/dashboard', {templateUrl: '/dashboard/all', controller: 'indexController'})
  .when('/dashboard/user/developer', {templateUrl: '/dashboard/developer', controller: 'developerController'})
  .when('/dashboard/files/all', {templateUrl: '/dashboard/all', controller: 'indexController'})
  .when('/dashboard/user/account', {templateUrl: '/dashboard/personal', controller: 'accountController'});    
}])
.controller('indexController', ['$scope', '$http', '$cookies', function indexController($scope, $http, $cookies){

}])
.controller('developerController', ['$scope', '$sanitize', 'Authenticate', function($scope, $sanitize, Auth){
  $scope.submit4key = function(){
    Auth.getApiKey(function(r){
      $scope.thisClientKey = r.clientKey;
    });
  };
}])
.controller('accountController', ['$scope', 'accountServices', function($scope, as){

  as.getUser(function(r){
    $scope.user = _.extend({_id: $scope.cuser}, r);
  });

  $scope.updateAc = function(){
    // if($scope.user.password !== $scope.passwordC){
    //     $scope.accountForm.passwordC.$invalid = true;
    //     return false;
    // }
    as.update($scope.user, function(r){

    });
  };
}])
.controller('filesController', ['$scope', '$http', 'Keeper', 'Tabs', 'Alert', function filesController($scope, $http, Keeper, T, Alert){
  function init(){
    var param = {user: $scope.cuser};
    //Call for the home folder and its content
    Keeper.fetchFolder({id: $scope.home_folder}, function(r){
      if(r !== false){
        T.createTab({
          title: 'Home',
          id: 'home-tab',
          list: r
        });
          // angular.forEach(r, function(value, key){
          //   $scope.files.push(value);
          // });
      }
    });
  }
  init();

  $scope.trashFile = function(index, tabIndex){         
    //var ixid = $scope.files[index].ixid;
    var fileList = T.tabs[tabIndex].list[index];
    var ixid = fileList.ixid;
    Keeper.deleteThisFile(ixid, function(){
      $scope.cabinetTabs[tabIndex].list.splice(index, 1);
    });
  };

  $scope.refresh_tab = function(index){
    console.log(index);
  };
  $scope.close_tab = function(index){
    console.log(index);
  };
  $scope.create_folder = function(){
    
    Alert.set_prompt({
      heading: 'Funny Shit',
      message: 'So Cool, no oil',
      type: 'danger',
      icon: 'fa-times',
      exec: function(){
        console.log('hallo');
      }
    });
  };
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
      $scope.uploadStateText = 'Resume';
      $scope.uploadStateClass = 'fa-play';
      Sharer.resumable.pause();
    }else{
      $scope.uploadStateText = 'Pause';
      $scope.uploadStateClass = 'fa-pause';
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

