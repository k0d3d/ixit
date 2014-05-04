//services.js
angular.module('services', [])
  .factory('Authenticate', function($http){
      var a = {};

      a.postParam = function(loginParams){
        return $http.post('/api/internal/users/session', loginParams)
          .then(function (d) {
            return d;
          }, function (e) {
            return e;
          });
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
  .factory('Keeper', ['$http', 'Alert', function($http, Alert){
      var a = {};
  
      a.fetchFolder = function(folderParam, cb){
        console.log(folderParam);
        $http.get('/api/internal/user/folder?'+ $.param(folderParam))
        .success(function(list){
          cb(list);
        })
        .error(function(err){
          Alert.set_notice({
            message: err,
            type: 'danger',
          });  
        });
      };

      a.createSubFolder = function(name, parentId, cb){
        $http.post('/api/internal/user/folder', {
          name: name,
          parentId: parentId,
          type: 'sub'
        })
        .success(function(r){
          cb(r);
        })
        .error(function(err){
          Alert.set_notice({
            message: err,
            type: 'danger',
          });          
        });
      };
      
      /**
       * [thisUserFiles request for files belonging to this user]
       * @param  {[type]}   param
       * @param  {Function} callback
       * @return {[type]}
       */
      a.thisUserFiles = function(param, callback){
        $http.get('/api/internal/user/files', param)
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
        $http.get('/api/internal/user/queue', param)
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
        $http.delete('/api/internal/user/files/'+ixid)
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
        $http.delete('/api/internal/user/queue/'+mid)
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
        $http.put('/api/internal/user/files/'+file_id+'/tags', {tags: tags})
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
  
      a.makeFolder = function(foldername, parent, cb){
  
      };
  
      return a;
    }])
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
          _.some(this.filequeue, function(v, i){
              //File is not on queue..
              if(isExistingFile(v, file)){
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
      if(typeof(position) === 'number'){
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
  /**
   * The alert factory handles all notifications 
   * and alerts on the UI. 
   * 
   * Prompts are interactive notifications where the users feedback(yes or no)
   * determines the action that will be carried out.
   * Prompts should / must possess an 'exec' property which 
   * is a function to be called when the user selects 'yes'
   *
   * Notifications are alerts that inform the user about the 
   * result or status of actions, request, queries carried out 
   * on the UI. The are usually timed and dont require any feed back
   *
   * @param  {[type]} $rootScope [description]
   * @param  {[type]} $timeout   [description]
   * @return {[type]}            [description]
   */
  .factory('Alert', ['$rootScope', 'Language', function($rootScope, L){
    var s = {};
    //Color class for what type of alert to show
    //danger, success and info
    var __state = {
      'success':{
        class: 'x-alert-success'
      },
      'info':{
        class: 'x-alert-info'
      },
      'danger':{
        class: 'x-alert-danger',
        heading: L.eng.error,
        icon: 'fa-warning'
      }
    };

    /**
     * Prompts is an object that holds the properties of an
     * alert prompt. 
     * title {String} 
     * 
     * @type {[type]}
     */
    s.prompts = null;
    s.notes = null;

    s.set_prompt = function (n) {
      this.prompts = n;
      this.prompts.class= __state[n.type].class;

      this.broadcastPrompt();
    };

    //Subtle notifications esp when connections
    //to server fail
    s.set_notice = function(n){
      this.notes = n;
      this.notes.class= __state[n.type].class;
      this.notes.heading= __state[n.type].heading;
      this.notes.icon= __state[n.type].icon;

      this.broadcastNotice();
    };

    s.broadcastPrompt = function() {
      $rootScope.$broadcast('newPrompt');
    };
    s.broadcastNotice = function() {
      $rootScope.$broadcast('newNotice');
    };

    return s;
  }])
  .factory('Tabs', [ '$rootScope', function($rootScope){
    var s = {};

    //Dunno! but for all tabs
    s.tabs = [];

    //This will hold the current tab properties
    s.tab = null;

    /**
     * createTab creates a tab on the file cabinet page
     * @param  {Object} n object with title and file list properties
     * @return {[type]}   [description]
     */
    s.createTab = function(n){
      this.tab = n;
      this.reTab();
    };

    s.reTab = function(){
      $rootScope.$broadcast('newTab');
    };

    s.closeTab = function(){

    };
    return s;
  }]);