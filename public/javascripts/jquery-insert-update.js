$(document).ready(function() {
    $('button#okButton').click(function(event) {
        if (!validateDate($('input[name="dt_born"]').val(), 'pt-br')) {
            event.preventDefault();
            alert('Invalid date. Inform a correct date or do not fill in the field.');
            $('input[name="dt_born"]').focus();
        }
        //else
            //$('form#insert_update').submit();
    });
    $('input#okButton').click(function(event) {
        if (!validateDate($('input[name="dt_born"]').val(), 'pt-br')) {
            event.preventDefault();
            alert('Invalid date. Inform a correct date or do not fill in the field.');
            $('input[name="dt_born"]').focus();
        }
        //else
            //$('form#insert_update').submit();
    });
});
