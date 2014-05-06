angular.module('dashboard',[])
.config(['$stateProvider', function ($stateProvider){
  $stateProvider
  .state('cabinet', {
    abstract: true,
    url: '/cabinet',
    views: {
      'main' : {
        templateUrl: '/dashboard/all', 
      }
    },
    controller: 'indexController'
  })
  .state('cabinet.files', {
    url: '/files/all',
    views: {
      'cabinetView@cabinet' : {
        templateUrl: '/templates/dashboard/cabinet',
      }
    },
    controller: 'filesController',
    resolve: {
      contenter: function (Keeper, $http) {
        return $http.get('/api/internal/users/folder?id=home')
        .then(function (data) {
          return data.data;
        });
        // console.log($stateParams);
      }
    }
  })
  .state('cabinet.folder', {
    url: '/folder/:folderId',
    views: {
      'cabinetView@cabinet' : {
        templateUrl: '/templates/dashboard/cabinet'
      }
    },
    controller: 'filesController',
    resolve: {
      contenter: function ($stateParams, $http) {
        return $http.get('/api/internal/users/folder?id=' + $stateParams.folderId)
        .then(function (data) {
          return data.data;
        });
        // console.log($stateParams);
      }
    }
  })
  
  ;    
}])
.controller('indexController', ['$scope', '$http', '$cookies', '$state', function indexController($scope, $http, $cookies, $state){
  $state.transitionTo('cabinet.files');
  console.log('message');
}])
.controller('filesController', [
  '$scope', 
  '$http', 
  'Keeper', 
  'Tabs', 
  '$state', 
  function filesController ($scope, $http, Keeper, Tabs, contenter) {
  function init(){
    console.log('contenter');
    if (contenter.length) {
      // T.reloadHome({
      //     title: 'Home',
      //     id: 'home-tab',
      //     list: $scope.cabinetContent       
      // });
    } else {
      //Call for the home folder and its content
      Keeper.fetchFolder({id: $scope.current_folder}, function(r){
        if(r !== false){
          Tabs.createTab({
            title: 'Home',
            id: 'home-tab',
            list: r
          });
        }
      });
    }
  }
  init();

  $scope.hasContent = function () {
    if ($scope.cabinetTabs[0].list.files.length > 0 || 
      $scope.cabinetTabs[0].list.folders.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  $scope.trashFile = function(index, tabIndex){         
    //var ixid = $scope.files[index].ixid;
    var fileList = Tabs.tabs[tabIndex].list[index];
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

