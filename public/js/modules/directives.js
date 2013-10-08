
    /**
     * Home Module
     */
    angular.module('directives',[]);

    /**
     * [uploadHandler ] Handles posting uploaded files to the server and displaying 
     * results
     * @return {[type]} [description]
     */
    // angular.module('directives').directive('uploadHandler', function(){
    //     var _formatFileSize = function (bytes) {
    //         if (typeof bytes !== 'number') {
    //             return '';
    //         }
    //         if (bytes >= 1000000000) {
    //             return (bytes / 1000000000).toFixed(2) + ' GB';
    //         }
    //         if (bytes >= 1000000) {
    //             return (bytes / 1000000).toFixed(2) + ' MB';
    //         }
    //         return (bytes / 1000).toFixed(2) + ' KB';
    //     };
    //     var _formatBitrate = function (bits) {
    //         if (typeof bits !== 'number') {
    //             return '';
    //         }
    //         if (bits >= 1000000000) {
    //             return (bits / 1000000000).toFixed(2) + ' Gbit/s';
    //         }
    //         if (bits >= 1000000) {
    //             return (bits / 1000000).toFixed(2) + ' Mbit/s';
    //         }
    //         if (bits >= 1000) {
    //             return (bits / 1000).toFixed(2) + ' kbit/s';
    //         }
    //         return bits.toFixed(2) + ' bit/s';
    //     };

    //     var _formatTime = function (seconds) {
    //         var date = new Date(seconds * 1000),
    //             days = parseInt(seconds / 86400, 10);
    //         days = days ? days + 'd ' : '';
    //         return days +
    //             ('0' + date.getUTCHours()).slice(-2) + ':' +
    //             ('0' + date.getUTCMinutes()).slice(-2) + ':' +
    //             ('0' + date.getUTCSeconds()).slice(-2);
    //     };

    //     var _formatPercentage = function (floatValue) {
    //         return (floatValue * 100).toFixed(2) + ' %';
    //     };

    //     var _renderExtendedProgress = function (data) {
    //         return this._formatBitrate(data.bitrate) + ' | ' +
    //             this._formatTime(
    //                 (data.total - data.loaded) * 8 / data.bitrate
    //             ) + ' | ' +
    //             this._formatPercentage(
    //                 data.loaded / data.total
    //             ) + ' | ' +
    //             this._formatFileSize(data.loaded) + ' / ' +
    //             this._formatFileSize(data.total);
    //     };
    //     var i = 0;
    //     function link (scope, element, attrs){
    //         element.hide();
    //         $(element).fileupload({
    //             url: 'http://192.168.1.7:8080',
    //             sequentialUploads: true,
    //             dropZone: $(attrs.uploadDropZone),
    //             dataType: 'json',
    //             singleFileUploads:true,
    //             fileInput: $(element),
    //             filesContainer:$(attrs.uploadFilesContainer),
    //             maxChunkSize: 10000000,
    //             multipart: true,
    //             dragover: function(e){
    //                 /**
    //                  * TODO:: Create directive or bind dragover and drop events seperately 
    //                  */
    //                 $('.noticebox').css({'background-image':'url(../app/img/cloud-over.png)'});
    //                 $('.accordion-pane').css({'box-shadow': '0 1px 6px rgba(85, 84, 84, 0.61)','background-color':'#ffffff'});
    //             },
    //             add: function(e,data){
    //                 $('.noticebox').hide();
    //                 $('.accordion-pane').removeClass('empty').addClass('stuffed');
    //                 $('.drop-overlay').hide();
    //                 $(attrs.uploadDropZone).trigger('scrollbar');
    //                 var file = [];
    //                 console.log(data);
    //                 angular.forEach(data.files,function(v, index){
    //                     var i = $('.ix-accordion-list li.ixlist').length;
    //                     file['name'] = v.name;
    //                     file['type']  = v.type;
    //                     file['size'] = _formatFileSize(v.size);
    //                     file['id'] = index;
    //                     i++;
    //                 });
                    
    //                 scope.filequeue.push(file);
    //                 scope.qcount = scope.filequeue.length;
    //                 data.currentIndex = Number(scope.qcount - 1);
    //                 scope.$apply();
    //                 //files[0]['size'] = _formatFileSize(files[0]['size']);
    //                 //var nd = ich.tmplfile(file,true);
    //                 //data.context = $('<li/>').addClass('ixlist').attr('id','ix-list-li-'+file['id']).html(nd).prependTo(".ix-accordion-list");
    //                 $('#extended-info span a').tooltip();
    //                 var jxhr = data.submit()
    //                             .success(function(result,textStatus,jqXHR){
    //                                 result = result.files[0];
    //                                 //$(data.context).data('ixid',result.payload);
    //                                 //$(data.context).data('filename',result.filename);
    //                                 //$('.progressHolder', data.context).hide();
    //                                 //$('.nexus', data.context).css('margin-top','0px').prepend('<p><strong>Link: </strong><a href="http://'+getDomain(document.URL)+'/'+result.payload+'" target="_blank" class="ix-link">http://'+getDomain(document.URL)+'/'+result.payload+'</a></p>');
    //                                 //$('.itemThumb img.img-polaroid', data.context).attr('src','http://i-x.it/scripts/timthumb.php?src='+result.thumbnail_url+'&w=50&h=50');
    //                             });
    //             },
    //             progress: function(e,data){
    //                 console.log(data.loaded);
    //                 var progress = parseInt(data.loaded / data.total * 100, 10);
    //                 scope.filequeue[data.currentIndex].tfrate = _formatBitrate(data.bitrate);
    //                 scope.filequeue[data.currentIndex].tftime = _formatTime((data.total - data.loaded) * 8 / data.bitrate);
    //                 scope.filequeue[data.currentIndex].progress = progress+'%';
    //                 scope.$apply();

    //                 // $('.tf-tag').hide();
                    
    //                 // $('.tf-speed', data.context).text();
    //                 // $('.tf-time', data.context).text(_formatTime((data.total - data.loaded) * 8 / data.bitrate));
    //                 // $('.progressHolder .bar', data.context).css('width',);
    //             },
    //             done: function (e, data) {
    //                 $('.progress .status', data.context).text('done');
    //                 data.files.length = 0;
    //             }
    //         });
    //     }
    //     return{
    //         link: link
    //     };
    // });

    angular.module('directives').directive('uploadHandler', function(){
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
        function link (scope, element, attrs){
             var r = new Resumable({
                target:'http://ixit.vm:3000/upload',
                chunkSize:1*1024*1024,
                simultaneousUploads:4,
                testChunks:false,
                maxFiles: 10,
                generateUniqueIdentifier : function(){
                    function s4() {
                      return Math.floor((1 + Math.random()) * 0x10000)
                                 .toString(16)
                                 .substring(1);
                    }
                    return s4() + s4() + '-' + s4() + s4()+'-'+s4();
                }
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
                var ade = {
                    name: file.fileName,
                    size: _formatFileSize(file.size),
                    class: file.uniqueIdentifier
                };
                console.log(r.getFromUniqueIdentifier(ade.class));
                scope.filequeue.push(ade);
                console.log(file);
                scope.qcount = scope.filequeue.length;
                scope.$apply();
                // Actually start the upload
                r.upload();
              });
              r.on('pause', function(){
                  // Show resume, hide pause
                  $('.resumable-progress .progress-resume-link').show();
                  $('.resumable-progress .progress-pause-link').hide();
              });
              r.on('complete', function(){
                scope.isUploading = r.isUploading();
                console.log(r.isUploading());
                scope.$apply();
                  // Hide pause/resume when the upload has completed
                  $('.resumable-progress .progress-resume-link, .resumable-progress .progress-pause-link').hide();
              });
              r.on('fileSuccess', function(file,message){
                  // Reflect that the file upload has completed
                  $('.resumable-file-'+file.uniqueIdentifier+' .resumable-file-progress').html('(completed)');
              });
              r.on('fileError', function(file, message){
                  // Reflect that the file upload has resulted in error
                  $('.resumable-file-'+file.uniqueIdentifier+' .resumable-file-progress').html('(file could not be uploaded: '+message+')');
              });
              r.on('fileProgress', function(file){
                console.log(file.progress());
                console.log(r.progress());
                  // Handle progress for both the file and the overall upload
                  //$('.'+file.uniqueIdentifier+' .resumable-file-progress').html(Math.floor(file.progress()*100) + '%');
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
        return {
            link: link
        }
    });

    angular.module('directives').directive('dragover', function(){
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

    angular.module('directives').directive('scrollBar', function(){
        return {
            link: function(scope, element, attrs){
                $(element).on('scrollbar', function(){
                    if(element.height() >= attrs.maxContainerHeight){
                        element.slimScroll({
                            height: attrs.maxContainerHeight+'px',
                            distance: '0'
                        });
                    }
                });
            }
        };
    });
