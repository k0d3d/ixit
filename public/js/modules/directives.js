
    /**
     * Home Module
     */
    angular.module('directives',[]);

    /**
     * [uploadHandler ] Handles posting uploaded files to the server and displaying 
     * results
     * @return {[type]} [description]
     */
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
            $('#browsefield').fileupload({
                url: 'http://192.168.1.5:8080',
                sequentialUploads: true,
                dropZone: $(attrs.uploadDropZone),
                dataType: 'json',
                singleFileUploads:true,
                fileInput: $('#browsefield'),
                filesContainer:$(attrs.uploadFilesContainer),
                maxChunkSize: 10000000,
                multipart: true,
                dragover: function(e){
                    $('.noticebox').css({'background-image':'url(../app/img/cloud-over.png)'});
                    $('.accordion-pane').css({'box-shadow': '0 1px 6px rgba(85, 84, 84, 0.61)','background-color':'#ffffff'});
                },
                add: function(e,data){
                    $('.noticebox').hide();
                    $('.accordion-pane').removeClass('empty').addClass('stuffed');
                    $(attrs.uploadDropZone).trigger('scrollbar');
                    console.log(data);
                    var file = [];
                    $.each(data.files,function(index, v){
                        var i = $('.ix-accordion-list li.ixlist').length;
                        file['name'] = v.name;
                        file['type']  = v.type;
                        file['size'] = _formatFileSize(v.size);
                        file['id'] = i;
                    });
                    var qcount = Number(data.files.length);
                    //files[0]['size'] = _formatFileSize(files[0]['size']);
                    var nd = ich.tmplfile(file,true);
                    data.context = $('<li/>').addClass('ixlist').attr('id','ix-list-li-'+file['id']).html(nd).prependTo(".ix-accordion-list");
                    $('#extended-info span a').tooltip();
                    var jxhr = data.submit()
                                .success(function(result,textStatus,jqXHR){
                                    result = result.files[0];
                                    $(data.context).data('ixid',result.payload);
                                    $(data.context).data('filename',result.filename);
                                    $('.progressHolder', data.context).hide();
                                    $('.nexus', data.context).css('margin-top','0px').prepend('<p><strong>Link: </strong><a href="http://'+getDomain(document.URL)+'/'+result.payload+'" target="_blank" class="ix-link">http://'+getDomain(document.URL)+'/'+result.payload+'</a></p>');
                                    $('.itemThumb img.img-polaroid', data.context).attr('src','http://i-x.it/scripts/timthumb.php?src='+result.thumbnail_url+'&w=50&h=50');
                                });
                },
                progress: function(e,data){
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $('.tf-tag').hide();
                    $('.tf-speed', data.context).text(_formatBitrate(data.bitrate));
                    $('.tf-time', data.context).text(_formatTime((data.total - data.loaded) * 8 / data.bitrate));
                    $('.progressHolder .bar', data.context).css('width',progress+'%');
                },
                done: function (e, data) {
                    $('.progress .status', data.context).text('done');
                    data.files.length = 0;
                }
            });
        }
        return{
            link: link
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
