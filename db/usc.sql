
/*drop database usc;*/
create database usc DEFAULT CHARACTER SET utf8mb4;

/*drop user 'usc'@'localhost';*/
create user 'usc'@'localhost' identified by 'usc';

use usc;

/*drop table user;*/
create table user (
    id_user int NOT NULL AUTO_INCREMENT,
    nm_email varchar(64) NOT NULL,
    nu_level tinyint(4) DEFAULT NULL,
    qt_min_members smallint(6) DEFAULT NULL,
    nu_mobile varchar(24) DEFAULT NULL,
    nu_tel varchar(24) DEFAULT NULL,
    nm_prefix varchar(10) DEFAULT NULL,
    nm_cn varchar(96) DEFAULT NULL,
    nm_nickname varchar(64) DEFAULT NULL,
    nm_password varchar(72) DEFAULT NULL,
    id_gender char(1) DEFAULT NULL,
    dt_born date DEFAULT NULL,
    cd_city smallint(6) DEFAULT NULL,
    id_parent_user int DEFAULT NULL,
    in_auth_email boolean DEFAULT true,
    in_auth_sms boolean DEFAULT true,
    in_auth_whatsapp boolean DEFAULT false,
    dt_created date NOT NULL,
    /*ts_created date DEFAULT CURRENT_TIMESTAMP,*/
    /*dc_json json DEFAULT NULL,*/
    PRIMARY KEY (id_user),
    KEY fk_user_1_idx (id_user),
    CONSTRAINT fk_person_1 FOREIGN KEY (id_parent_user) REFERENCES user (id_user) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

grant all on usc.* to 'usc'@'localhost';


insert into user(nm_email, nu_level, qt_min_members, nu_mobile, nu_tel, nm_prefix, nm_cn, nm_nickname, nm_password, id_gender, dt_born, cd_city, id_parent_user, in_auth_email, in_auth_sms, in_auth_whatsapp) values
('master@???.???', 0, 1000, '00 00000-0000', null, '', 'Master', 'Master', '198adf1cb3349e3b536ad2fca14df30a:6a8513adcae05c35b219c6d6949591fa', 'M', '1980-01-01', 0, null, true, true, false);

