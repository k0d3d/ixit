 
$(function () {
    // $(this).bind('dragleave', function(){
    //     $('.noticebox').css({'background-image':'url(../app/img/cloud-normal.png)'});
    //     $('.accordion-pane').css({'box-shadow': '0 1px 6px rgba(188, 188, 188, 0.61) inset','background-color':'rgba(255, 255, 255, 0.28)'});

    // });
    // $('body').on('dragleave', function(){
    // 	$('.drop-overlay').hide();
    // });
    // $('body').on('dragover dragenter', function(){
    // 	$('.drop-overlay').show();
    // });
    $(document).bind('drop dragover', function (e) {
        e.preventDefault();
    });

    $('.bar-n-body').height($('.content').innerHeight());
    $(window).on('resize', function (e) {
        $('.bar-n-body').height($('.content').innerHeight());
        var element = $('.tab-pane');
        $(element).slimScroll({destroy: true});
        var elTop = $(element).offset().top, wrapHeight = $('#wrap').height();
        $(element).slimScroll({
          height: wrapHeight - elTop + 'px'
        });            
    });
});
