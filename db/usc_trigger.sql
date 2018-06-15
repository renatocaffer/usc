
use usc;

DROP TRIGGER IF EXISTS in_b_user_check;
DELIMITER //
CREATE TRIGGER in_b_user_check BEFORE INSERT ON user
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM user AS u WHERE u.nu_mobile = NEW.nu_mobile) THEN
        SIGNAL sqlstate '45001' set message_text = "User note deleted. This mobile number alredy exists.";
    /*ELSEIF NEW.nu_mobile = '00 00000-0000' THEN*/
    ELSE
        SET NEW.dt_created = CURDATE();
    END IF;
END;//
DELIMITER ;


DROP TRIGGER IF EXISTS up_b_user_check;
DELIMITER //
CREATE TRIGGER up_b_user_check BEFORE UPDATE ON user
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM user AS u WHERE u.nu_mobile = NEW.nu_mobile AND NEW.nu_mobile <> OLD.nu_mobile) THEN
        SIGNAL sqlstate '45002' set message_text = "User note modified. This mobile number alredy exists.";
    END IF;
END;//
DELIMITER ;


DROP TRIGGER IF EXISTS de_b_user_check;
DELIMITER //
CREATE TRIGGER de_b_user_check BEFORE DELETE ON user
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM user AS u INNER JOIN user as u2 on u.id_user = u2.id_parent_user WHERE u.id_user = OLD.id_user) THEN
        SIGNAL sqlstate '45003' set message_text = "User not deleted. There are users under this user (node) in the tree view model.";
    END IF;
END;//
DELIMITER ;

