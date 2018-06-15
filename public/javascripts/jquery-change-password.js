$(document).ready(function() {
    $('button#okButton').click(function(event) {
        if ($('input[name="nm_password"]').val() == $('input[name="nm_password_new"]').val()) {
            event.preventDefault();
            alert('New password must be different from the current one.');
            $('input[name="nm_password"]').focus();
        }
        else
        if ($('input[name="nm_password_new"]').val() != $('input[name="nm_password_new_confirm"]').val()) {
            event.preventDefault();
            alert('New password must be equal to the confirmation password.');
            $('input[name="nm_password_new"]').focus();
        }
        //else
            //$('form#insert_update').submit();
    });
});
