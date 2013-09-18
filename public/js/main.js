 
$(function () {
    $(this).bind('dragleave', function(){
        console.log('try');
        $('.noticebox').css({'background-image':'url(../app/img/cloud-normal.png)'});
        $('.accordion-pane').css({'box-shadow': '0 1px 6px rgba(188, 188, 188, 0.61) inset','background-color':'rgba(255, 255, 255, 0.28)'});
    });
    $(document).bind('drop dragover', function (e) {
        e.preventDefault();
    });
});
