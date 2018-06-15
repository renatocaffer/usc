function centerBox(backgroundSelector, boxSelector) {
    $(backgroundSelector).css({'opacity': 0.25});
    $(boxSelector).css({'opacity': 1.00});
    $(boxSelector).animate({
        top: ($(window).height() - $(boxSelector).outerHeight())/2,
        left: ($(window).width() - $(boxSelector).outerWidth())/2
    });
}

function validateDate(dateString, locale) {
    var day = dateString.substr(0,2);
    var bar1 = dateString.substr(2,1);
    var month = dateString.substr(3,2);
    var bar2 = dateString.substr(5,1);
    var year = dateString.substr(6,4);

    if (dateString == '') return true;

    if (dateString.length != 10 || bar1 != "/" || bar2 != "/" || day > 31 || month > 12 ) return false;
    if ((month == 4 || month == 6 || month == 9 || month == 11 ) && day == 31) return false;
    if (month == 2 && (day > 29 || (day == 29 && year % 4 != 0))) return false;
    if (year < 1900) return false;

    return true;
}