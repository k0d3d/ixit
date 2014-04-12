angular.module('dashboard',[])
.config(['$stateProvider', function ($stateProvider){
  $stateProvider
  .state('dashboard', {
    url: '/dashboard',
    templateUrl: '/dashboard/all', 
    controller: 'filesController'
  })
  .state('dashboard.files', {
    url: '/dashboard/files/all',
    templateUrl: '/dashboard/all', 
    controller: 'filesController'
  })
  .state('dashboard.folder', {
    url: '/dashboard/folder/:folderId',
    templateUrl: '/dashboard/all', 
    controller: 'filesController',
    resolve: {
      files: function ($stateParams) {
        console.log($stateParams);
      }
    }
  })
  .state('dashboard.account', {
    url: '/dashboard/user/account',
    templateUrl: '/dashboard/personal', 
    controller: 'accountController'
  });    
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
.controller('filesController', ['$scope', '$http', 'Keeper', 'Tabs', function filesController($scope, $http, Keeper, T){
  function init(){
    console.log('message');
    //Call for the home folder and its content
    Keeper.fetchFolder({id: $scope.current_folder}, function(r){
      if(r !== false){
        T.createTab({
          title: 'Home',
          id: 'home-tab',
          list: r
        });
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
    if(!$scope.newFolderInput) return false;
    //Using the current_folder scope property from the parent scope
    //as the parentId for the subfolder being created.
    Keeper.createSubFolder($scope.newFolderInput, $scope.current_folder, function(r){
      //The home tab is the first tab so we push in there.
      $scope.cabinetTabs[0].list.folders.push(r);
    });
  };
  $scope.open_folder = function(index){
    var _folder = $scope.cabinetTabs[0].list.folders[index];
    //push the foldername into our path
    $scope.$parent.path.push(_folder);
  };
  $scope.up_folder = function(){
    
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

