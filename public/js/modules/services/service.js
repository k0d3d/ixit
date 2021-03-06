//services.js
angular.module('services', [])
  .factory('Authenticate', function($http){
      var a = {};

      a.postParam = function(loginParams, callback){
        $http.post('/api/users/session', loginParams)
        .success(callback)
        .error(callback);
      };

      a.logout = function(){

      };

      a.getApiKey = function(cb){
        $http.get('/users/developer/apikey')
        .success(function(data){
          cb(data);
        })
        .error(function(data){

        });
      };

      return a;
  })
  .factory('Keeper', function($http){
    var a = {};
    /**
     * [thisUserFiles request for files belonging to this user]
     * @param  {[type]}   param
     * @param  {Function} callback
     * @return {[type]}
     */
    a.thisUserFiles = function(param, callback){
      $http.get('/api/user/files', param)
      .success(function(data, status){
          callback(data);
      })
      .error(function(data, status){
          console.log(data);
          callback(false);
      });
    };

    /**
     * [thisUserQueue request for this users uncompleted queue]
     * @param  {[type]}   param
     * @param  {Function} callback
     * @return {[type]}
     */
    a.thisUserQueue = function(param, callback){
      $http.get('/api/user/queue', param)
      .success(function(data, status){
          callback(data);
        })
      .error(function(data, status){
          console.log(data);
          callback(false);
        });
    };

    /**
     * [deleteThisFile deletes a file belonging to the user]
     * @param  {[type]}   ixid
     * @param  {Function} callback
     * @return {[type]}
     */
    a.deleteThisFile = function(ixid, callback){
      $http.delete('/api/user/files/'+ixid)
      .success(function(data, status){
        callback(data);
      })
      .error(function(data, status){

      });
    };

    /**
     * [removeFromQueue removes an upload from the queue]
     * @param  {[type]}   mid
     * @param  {Function} callback
     * @return {[type]}
     */
    a.removeFromQueue = function(mid, callback){
      $http.delete('/api/user/queue/'+mid)
      .success(function(data, success){
        callback();
      })
      .error(function(data, success) {
          /* Act on the event */
      });
    };

    /**
     * [updateTags updates tags belonging ]
     * @param  {[type]}   tags
     * @param  {Function} cb
     * @return {[type]}
     */
    a.updateTags = function(tags, file_id, cb){
      $http.put('/api/user/files/'+file_id+'/tags', {tags: tags})
      .success(function(d){

      })
      .error(function(d){

      });
    };

    a.search = function(query, cb){
      $http.get('/api/search/'+query)
      .success(function(d){
        cb(d);
      })
      .error(function(err){

      });
    };

    return a;
  })
  .factory('Sharer', function($rootScope){
      var s = {};
 
      s.filequeue = [];

      s.warning = 0;

      s.queue = function(r){
          this.filequeue.push(r);
          this.filequeue = _.flatten(this.filequeue);
          this.broadcastItem();
      };

      function isExistingFile(q, file){
          if(q.identifier === file.uniqueIdentifier){
              //Return False so file isnt added to queue
              return true;
          }else{
              return false;
          }
      }

      s.addToQueue = function(file){
          var add;
          var self = this;
          var notfound = true;
          var l = this.filequeue.length;
          if( l > 0){
              this.filequeue
              _.some(this.filequeue, function(v, i){
                  //File is not on queue..
                  if(!isExistingFile(v, file)){
                  }else{
                      notfound = false;
                      self.filequeue[i].isQueued = 'true';
                      return true;
                  }
              });
              if(notfound === true){
                  self.queue({
                      filename: file.fileName,
                      size: file.size,
                      identifier: file.uniqueIdentifier
                  });
              }
          }else{
              this.queue({
                  filename: file.fileName,
                  size: file.size,
                  identifier: file.uniqueIdentifier
              });
          }
      };

      s.removeFromQueue = function(fileIdentifier){
          var position;
          _.some(this.filequeue, function(v ,i){
              //File is not on queue..
              if(v.identifier === fileIdentifier){
                  position = i;
                  return true;
              }
          });
          if(typeof(position) == 'number'){
              this.filequeue.splice(position, 1);
              this.broadcastItem();
          }
      };

      s.cancel = function(){
          this.filequeue.length = 0;
          this.broadcastItem();
      };

      s.broadcastItem = function() {
          $rootScope.$broadcast('onQueue');
      };

      return s;
  })
  .factory('Alert', function($rootScope, $timeout){
    var s = {};

    var __state = {
      'success':{

      },
      'info':{

      },
      'danger':{
        class: 'x-alert-danger'
      }
    };

    s.prompts = {
      heading: '',
      message: '',
      class: '',
      icon:''
    };    

    //Subtle notifications esp when connections
    //to server fail
    s.set_alert = function(n){
      this.prompts = n;
      this.prompts.class= __state[n.type].class;

      this.broadcastPrompt();
    };

    s.broadcastPrompt = function() {
      $rootScope.$broadcast('newPrompt');
    };

    return s;
  })
  .factory('Tabs', [ '$rootScope', function($rootScope){
    var s = {};

    s.tabs = [];

    /**
     * createTab creates a tab on the file cabinet page
     * @param  {Object} n object with title and file list properties
     * @return {[type]}   [description]
     */
    s.createTab = function(n){
      this.tabs.push(n)
      this.reTab();
    }

    s.reTab = function(){
      $rootScope.$broadcast('newTab');
    };

    s.closeTab = function(){

    };
    return s;
  }]);