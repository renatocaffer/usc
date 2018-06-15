$(document).ready(function() {
    centerBox('.wrapper', '.confirm-box');

    $(window).resize(function() {
        //centerBox('.confirm-box'));
        $(".confirm-box").css({
            'top': ($(window).height() - $('.confirm-box').outerHeight())/2, 
            'left': ($(window).width() - $('.confirm-box').outerWidth())/2
        });
    });

    $('button#cancelButton').click(function() {
        $('input[name="action"]').val('cancel');
        $('form#send_message').submit();
        //$('.wrapper').css({'opacity': 1.00});
    });

    $('button#confirmButton').click(function() {
        $('input[name="action"]').val('confirm');
        $('form#send_message').submit();
        //$('.wrapper').css({'opacity': 1.00});
    });
});
