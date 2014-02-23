
/**
 * Home Module
 */
angular.module('directives',[]);

var appDirective =  angular.module('directives');
/**
 * [uploadHandler ] Handles posting uploaded files to the server and displaying 
 * results
 * @return {[type]} [description]
 */
appDirective.directive('uploadHandler',['$cookies','Sharer','$rootScope', function($cookies, Sharer, $rootScope){
  var _formatFileSize = function (bytes) {
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
  var _formatBitrate = function (bits) {
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

  var _formatTime = function (seconds) {
    var date = new Date(seconds * 1000),
    days = parseInt(seconds / 86400, 10);
    days = days ? days + 'd ' : '';
    return days +
    ('0' + date.getUTCHours()).slice(-2) + ':' +
    ('0' + date.getUTCMinutes()).slice(-2) + ':' +
    ('0' + date.getUTCSeconds()).slice(-2);
  };

  var _formatPercentage = function (floatValue) {
    return (floatValue * 100).toFixed(2) + ' %';
  };

  var _renderExtendedProgress = function (data) {
    return this._formatBitrate(data.bitrate) + ' | ' +
    this._formatTime(
      (data.total - data.loaded) * 8 / data.bitrate
      ) + ' | ' +
    this._formatPercentage(
      data.loaded / data.total
      ) + ' | ' +
    this._formatFileSize(data.loaded) + ' / ' +
    this._formatFileSize(data.total);
  };
  var extraParams = function(fileObj, chunkObj){
    return {
      fileType : fileObj.file.type.length > 0 ? fileObj.file.type : 'noMime',
      throne: $cookies.throne
                //throne: 'januzaj'
    };
  };
  function link (scope, element, attrs){
    var r = new Resumable({
      target:'http://ixit.vm:3000/upload',
      chunkSize:1*1024*1024,
      simultaneousUploads:4,
      testChunks:true,
      maxFiles: 10,
      query: extraParams,
    });
            // Resumable.js isn't supported, fall back on a different method
    if(!r.support) {
      $('.resumable-error').show();
    } else {
      // Show a place for dropping/selecting files
      r.assignDrop($(attrs.dragover)[0]);
      r.assignBrowse($(attrs.uploadBrowse)[0]);


      // Handle file add event
      r.on('fileAdded', function(file){
        $('.drop-overlay').hide();

        //Reference the resumable object as a
        //property on the Sharer service
        Sharer.resumable = r;

        // Check if upload is on queue               
        Sharer.addToQueue(file);
        scope.$apply();
        
        //r.upload();
      });
      r.on('pause', function(){
          // Show resume, hide pause
          $('.resumable-progress .progress-resume-link').show();
          $('.resumable-progress .progress-pause-link').hide();
        });
      r.on('complete', function(){
        scope.isUploading = r.isUploading();
        scope.$apply();
        // Hide pause/resume when the upload has completed
        $('.resumable-progress .progress-resume-link, .resumable-progress .progress-pause-link').hide();
      });
      r.on('fileSuccess', function(file,message){
        //Remove an object from the file scope
        Sharer.removeFromQueue(file.uniqueIdentifier);
        scope.$apply();

        // Reflect that the file upload has completed
        $('.file-'+file.uniqueIdentifier).hide();
      });
      r.on('fileError', function(file, message){
          // Reflect that the file upload has resulted in error
          $('file-'+file.uniqueIdentifier).html('(file could not be uploaded: '+message+')');
        });
      r.on('fileProgress', function(file){
          // Handle progress for both the file and the overall upload
          $('.file-'+file.uniqueIdentifier+' .progress-bar').css({width: Math.floor(file.progress()*100) + '%'});
          //scope.overallUploadProgress = {width:Math.floor(r.progress()*100) + '%' };
          //scope.$apply();
          $('.navbar > .progress .progress-bar').css({width:Math.floor(r.progress()*100) + '%'});
        });
      r.on('cancel', function(){
        scope.isUploading = r.isUploading();
        scope.$apply();
        $('.resumable-file-progress').html('canceled');
      });
      r.on('uploadStart', function(){
        scope.isUploading = true;
        scope.$apply();
          // Show pause, hide resume
        $('.resumable-progress .progress-resume-link').hide();
        $('.resumable-progress .progress-pause-link').show();
      });
    }
  }

  function controller ($scope, $attrs, Sharer){
    $scope.$on('onQueue', function(){
      $scope.fileQueue = _.flatten(Sharer.filequeue);
    });
  }
  return {
    link: link
    //controller: controller
  };
}]);

appDirective.directive('dragover', function(){
  return {
    link: function(scope, element, attrs){
      element.on('dragover dragenter', function(){
        $(attrs.dragover).show();
      });
      element.on('dragleave', function(){
        $(attrs.dragover).hide();
      });
    }
  };
});

appDirective.directive('scrollBar', function(){
  return {
    link: function(scope, element, attrs){
      scope.$watch(function () {
        var ep = $(element).parent().height();
        if( element.height() > ep ){
          $(element).slimScroll({
            
          });
        }
      });
    }
  };
});

appDirective.directive('queueTip', function(){
  return {
    link: function(scope, element, attrs){
      element.tooltip({
        title: 'This upload will be resumed'
      });
    }
  }
});

appDirective.directive('loading', function(){
  return {
    link: link,

  }
});

appDirective.directive('profilephoto', function(){
  function link(scope, element, attrs){
    element.on('click', function(e){
      e.preventDefault();
      $('.p-ph-h-i').click();
      var r = new Resumable({
        target:'/user/account/photo',
        chunkSize:1*1024*1024,
        simultaneousUploads:1,
        testChunks:false,
        maxFiles: 1,
        fileParameterName : 'pp'
      });
          // Show a place for dropping/selecting files
          r.assignBrowse($('.p-ph-h-i')[0]);
          // Handle file add event
          r.on('fileAdded', function(file){              
            r.upload();
          });                 
        });
    element.on('mouseover', function(e){
      $(this).after('<span class="label label-default animated fadeInUp">Click to change</span>');
    });
    element.on('mouseout mouseleave', function(e){
      element.next('span.label').remove();
    })
  }
  return {
    restrict: 'EA',
    link: link,
  }
}); 
appDirective.directive('tagsInput', ['Keeper', function(K){
  function link (scope, element, attrs){

    $(element).tagsInput();
    scope.$watch(attrs.ngModel, function(n, o){
      if(_.isUndefined(n)) return false;
      $(element).importTags(n);
    });
    var id = $(element).attr('id');
    $('#'+id+'_tag').on('focusout', function(e){
      var tgs = $(element).val();
      if(tgs.length === 0) return false;
      var file_id = attrs.ixid;
      K.updateTags(tgs, file_id, function(){

      });
    });
  }
  return {
    link:link
  }
}]); 
appDirective.directive('dropdownHover', function(){
  function link (scope, element, attrs){
    $(element).dropdownHover();
  }
  return {
    link:link
  }
});
appDirective.directive('activateTab', function($timeout){
  function link(scope, element, attrs){
    if(scope.$last === true){
      $timeout(function(){
        //using the length so we can activate the last tab
        var lnt = scope.cabinetTabs.length - 1;
        var lastTab = scope.cabinetTabs[lnt].id;
        $('a.title[data-target="#'+lastTab+'"]').tab('show'); 
      });
    }    
  }
  return {
    link: link
  }
})
appDirective.directive('folderTabs', function(){
  function link(scope, element, attrs){

    // scope.$watch('cabinetTabs', function(n){
    //   console.log(n);
    //   if(_.isEmpty(n)) return false;
    //   // //using the length so we can activate the last tab
    //   // var lnt = scope.cabinetTabs.length - 1;
    //   // var lastTab = scope.cabinetTabs[lnt].id;
    //   // console.log(lastTab);
    //   // $('a.title[data-target="#'+lastTab+'"]').tab('show');      
    // });
}
return {
  link: link,
  templateUrl: '/templates/cabinet-tabs-tpl.jade'
}
});
appDirective.directive('notification', ['Alert', function(){
  function link(scope, element, attrs){
    scope.notes = []
    scope.$watch('notices', function(n){
      if(!_.isEmpty(n)) _queueNote(n);
    });
    function _queueNote(n){
      scope.notes.push(n);
      //Close the notification after 3 secs
      $timeout(function(){
        scope.close_note(scope.notes.length -1);
      }, 3000);
    };
  }
  function NoticeCtrl ($scope){
    //Close an alert
    $scope.close_note = function(index){
      scope.notes.splice(index, 1);
    };
    // //Execute the acceptance function
    // $scope.exec_yes = function(index){
    //   scope.notes[index].exec();
    // };
  }
  return {
    link: link,
    templateUrl: '/templates/notice-alert-tpl',
    scope:{
      notices: '=notice'
    },
    controller: NoticeCtrl
  }
}]);
appDirective.directive('prompt', ['Alert', function(AlertService){
  function link(scope, element, attrs){
    scope.a_p = []
    scope.$watch('alerts', function(n){
      if(!_.isEmpty(n)) _queueAlert(n);
    });
    function _queueAlert(n){
      scope.a_p.push(n);
    };
  }
  function AlertCtrl ($scope){
    //Close an alert
    $scope.close_an = function(index){
      $scope.a_p.splice(index, 1);
    };
    //Execute the acceptance function
    $scope.exec_yes = function(index){
      $scope.a_p[index].exec();
      $scope.a_p.splice(index, 1);
    };
  }
  return {
    link: link,
    templateUrl: '/templates/prompt-alert-tpl',
    scope:{
      prompts: '=prompt'
    },
    controller: AlertCtrl
  }
}]);