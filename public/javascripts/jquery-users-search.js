$(document).ready(function() {
    $('button#okButton').click(function(event) {
        if (!validateDate($('input[name="dt_born_from"]').val(), 'pt-br')) {
            event.preventDefault();
            alert('Invalid date. Inform a correct date or do not fill in the field.');
            $('input[name="dt_born_from"]').focus();
        }

        if (!validateDate($('input[name="dt_born_to"]').val(), 'pt-br')) {
            event.preventDefault();
            alert('Invalid date. Inform a correct date or do not fill in the field.');
            $('input[name="dt_born_to"]').focus();
        }
    });
});
