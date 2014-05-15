angular.module('dashboard',[])
.config(['$stateProvider', function ($stateProvider){
  $stateProvider
  .state('cabinet', {
    abstract: true,
    url: '/cabinet',
    views: {
      'main' : {
        templateUrl: '/dashboard/all'
      }
    },
    // controller: 'indexController'
  })
  .state('cabinet.files', {
    url: '/files/all',
    views: {
      'cabinetView@cabinet' : {
        templateUrl: '/templates/dashboard/cabinet',
        controller: 'indexController',
        resolve: {
          contenter: function ($http, Keeper) {
            return Keeper.openFolder({id: 'home'});
            // return $http.get('/api/internal/users/folder?id=home')
            // .then(function (data) {
            //   return data.data;
            // });
            // console.log($stateParams);
          }
        }
      }
    },
  })
  .state('cabinet.folder', {
    url: '/folder/:folderId',
    views: {
      'cabinetView@cabinet' : {
        templateUrl: '/templates/dashboard/cabinet',
        controller: 'filesController',
        resolve: {
          contenter: function ($stateParams, Keeper) {
            return Keeper.openFolder({id: $stateParams.folderId});
            // return $http.get('/api/internal/users/folder?id=' + $stateParams.folderId)
            // .then(function (data) {
            //   return data.data;
            // });
            // console.log($stateParams);
          }
        }
      }
    }
  })
  
  ;    
}])
.controller('indexController', [
  '$scope', 
  '$http', 
  '$cookies', 
  '$state', 
  'Tabs',
  'contenter',
  function indexController($scope, $http, $cookies, $state, Tabs, contenter){
  $scope.contenter = contenter;
  Tabs.reloadTab({
    title: 'Home',
    id: 'home-tab',
    list: $scope.contenter
  });  
}])
.controller('filesController', [
  '$scope', 
  '$http', 
  'Keeper', 
  'Tabs', 
  'contenter', 
  function filesController ($scope, $http, Keeper, Tabs, contenter) {
    console.log('files');
  $scope.contenter = contenter;
  Tabs.reloadTab({
    title: 'Home',
    id: 'home-tab',
    list: $scope.contenter
  }); 

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
    // var _folder = $scope.cabinetTabs[0].list.folders[index];
    // //push the foldername into our path
    // $scope.$parent.path.push(_folder);

  };
  $scope.up_folder = function(){
    
  };

  //Current Folder
  $scope.current_folder = Keeper.tab;
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
    $scope.uploadStateText = 'Resume';
    $scope.uploadStateClass = 'fa-play';    
  }
  init();

  $scope.toggleUpload = function(){
    if($scope.$flow.isUploading()){
      $scope.uploadStateText = 'Resume';
      $scope.uploadStateClass = 'fa-play';
      $scope.$flow.pause();
    }else{
      $scope.uploadStateText = 'Pause';
      $scope.uploadStateClass = 'fa-pause';
      $scope.$flow.upload();
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
    };

    //Cancels all uploads on the queue
    $scope.clearAll = function(){
      $scope.$flow.cancel();
      Sharer.cancel();
    };

    $scope.$on('onQueue', function(){
      $scope.filequeue = Sharer.filequeue;
    });
  }])
.filter('formatFileSize', function(){
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
  };
})
.filter('moment', function(){
  return function(time){
    var m = moment(time);
    return m.fromNow();
  };
})

;

