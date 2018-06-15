const express = require('express');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const Util = require('../public/javascripts/util');

const router = express.Router();

var util = new Util();

// Function - getUser
function getUser(loggedUserId, userId, allColumns, appParams, callback) {
    var query;
    var connection = mysql.createConnection({
        host     : appParams.db_host,
        user     : appParams.db_user,
        password : appParams.db_password,
        database : appParams.db_database
    });

    connection.connect();

    if (allColumns) //update
        query = 'select ' + loggedUserId + ' as id_logged_user, u2.nm_nickname as user_nickname, u2.nu_level as user_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created from user as u inner join user as u2 on u.id_user=' + userId + ' and u2.id_user=' + loggedUserId;
    else            //insert: parent_user = loggedUserId
        query = 'select ' + loggedUserId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, ' + loggedUserId + ' as id_user, '  + '\'\'' + ' as nm_email, u.nu_level, ' + appParams.qt_min_members_default + ' as qt_min_members, '  + '\'\'' + ' as nu_mobile, '  + '\'\'' + ' as nu_tel, '  + '\'\'' + ' as nm_prefix, '  + '\'\'' + ' as nm_cn, '  + '\'\'' + ' as nm_nickname, '  + '\'\'' + ' as id_gender, '  + '\'\'' + ' as dt_born, 0 as cd_city, ' + loggedUserId + ' as id_parent_user, null as dt_created from user as u where u.id_user=' + loggedUserId;

    connection.query(query, function (err, rows, fields) {
        if (err)// throw err;
            callback(err, {}, {});
        else
            callback(null, rows, fields);
    });

    connection.end();
}

// Respond to GET request to the /users/change-password route
router.get('/change-password', function(req, res, next) {
    if (req.session.userId) {
        //var appParams = req.app.locals.appParams;
        res.render('users-change-password', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Usuários - Alteração de Senha', right_block_title: 'Right Menu', session: req.session, action: '/users/change-password', method: 'POST'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    }
});

// Respond to POST/PUT request to the /users/change-password route
router.post('/change-password', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        var connection = mysql.createConnection({
            host     : appParams.db_host,
            port     : appParams.db_port,
            user     : appParams.db_user,
            password : appParams.db_password,
            database : appParams.db_database
        });
        var formParams = req.query;

        rows2 = [{
            id_logged_user: req.body.id_logged_user,
            user_nickname: req.body.user_nickname,
            user_level: req.body.user_level,
            id_user: req.body.id_user,
            id_parent_user: req.body.id_parent_user
        }];

        var query = 'select u.nm_password from user as u where u.id_user=' + req.session.userId;

        connection.connect();

        connection.query(query, function (err, rows, fields) {
            if (err) throw err;

            // "crypto_encryption_key" - must be 256 bytes (32 characters)
            // "crypto_iv_length" - for AES, this is always 16
            //if (1==1) {
            if (req.body.nm_password == util.randomDecrypt(appParams.crypto_algorithm, appParams.crypto_encryption_key, rows[0].nm_password)) {
                var query = 'update user as u set u.nm_password=\'' + util.randomEncrypt(appParams.crypto_algorithm, appParams.crypto_encryption_key, appParams.crypto_iv_length, req.body.nm_password_new) + '\' where u.id_user=' + req.session.userId;

                connection.query(query, function (err, rows, fields) {
                    if (err) throw err;

                    if (rows.affectedRows==1) {
                        res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Password changed.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                            if (err) throw err;
                            res.send(html);
                        });
                    }
                    else {
                        res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Houston: we have a problem. Check the input data and try again.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                            if (err) throw err;
                            res.send(html);
                        });
                    }      
                    connection.end();
                });
            }
            else {
                res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Password not changed.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                    if (err) throw err;
                    res.send(html);
                    connection.end();
                });
            }
        })
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    }
});

// Respond to GET request to the /users/list route
router.get('/list', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        var connection = mysql.createConnection({
            host     : appParams.db_host,
            user     : appParams.db_user,
            password : appParams.db_password,
            database : appParams.db_database
        });

        connection.connect();

        connection.query('select ' + req.session.userId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, case when u.nu_level=0 then (count(u2.id_user)-1) else count(u2.id_user) end as qt_ins_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created from user as u left join user as u2 on u.id_user=u2.id_parent_user where u.id_user=' + req.session.userId + ' group by u.nm_nickname, u.nu_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created union all select t2.* from (select ' + req.session.userId+ ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, count(u2.id_user) as qt_ins_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created from user as u left join user as u2 on u.id_user=u2.id_parent_user where u.id_parent_user=' + req.session.userId + ' and u.id_user<>' + req.session.userId + ' group by u.nm_nickname, u.nu_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created order by u.nm_cn) as t2', function (err, rows, fields) {
            if (err) throw err;

            res.render('users-list', {title: 'USC - Users - Tree View Model.', top_block_title: '', left_block_title: 'Menu', center_block_title: 'Users - Your List', right_block_title: 'Right Menu', session: req.session, rows: rows}, function(err, html) {
                if (err) throw err;
                res.send(html);
            });
        });

        connection.end();
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });  
    }
});

// Respond to GET request to the /users/search route
router.get('/search', function(req, res, next) {
    if (req.session.userId) {
        res.render('users-search', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Users - Search', right_block_title: 'Right Menu', session: req.session, action: '/users/search', method: 'POST'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });   
    }
});

// Respond to POST/PUT request to the /users/search route
router.post('/search', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        var connection = mysql.createConnection({
            host     : appParams.db_host,
            user     : appParams.db_user,
            password : appParams.db_password,
            database : appParams.db_database
        });
        var formParams = req.query;

        connection.connect();

        if (req.session.userLevel==0) { // Master
            var query = 'select ' + req.session.userId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, (count(u2.id_user)-1) as qt_ins_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created from user as u left join user as u2 on u.id_user=u2.id_parent_user where u.id_user=' + req.session.userId + ' group by u.nm_nickname, u.nu_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created union all select t2.* from (select ' + req.session.userId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, count(u2.id_user) as qt_ins_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created from user as u left join user as u2 on u.id_user=u2.id_parent_user where u.id_user<>' + req.session.userId;
            if (req.body.nm_cn != '')
                query += ' and u.nm_cn like ' + '\'%' + req.body.nm_cn + '%\'';
            if (req.body.nm_nickname != '')
                query += ' and u.nm_nickname like ' + '\'%' + req.body.nm_nickname + '%\'';
            if (req.body.nu_mobile != '')
                query += ' and u.nu_mobile like ' + '\'%' + req.body.nu_mobile + '%\'';
            if (req.body.id_gender != '')
                query += ' and u.id_gender = ' + '\'' + req.body.id_gender + '\'';
            if (req.body.dt_born_from != '')
                query += ' and u.dt_born >= ' + '\'' + util.formatDateDB(req.body.dt_born_from, 'mysql') + '\'';
            if (req.body.dt_born_to != '')
                query += ' and u.dt_born <= ' + '\'' + util.formatDateDB(req.body.dt_born_to, 'mysql') + '\'';
            if (req.body.qt_days_birth != '')
                query += ' and (DAYOFYEAR(curdate()) <= dayofyear(u.dt_born) and DAYOFYEAR(curdate())+' + req.body.qt_days_birth + ' >= dayofyear(u.dt_born))';
            if (req.body.nu_level_max != '')
                query += ' and u.nu_level <= ' + req.body.nu_level_max;
            if (req.body.nu_level != '')
                query += ' and u.nu_level = ' + req.body.nu_level;
            query += ' group by u.nm_nickname, u.nu_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created order by u.nm_cn) t2';
        } else {
            var query = 'select ' + req.session.userId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, (count(u2.id_user)-1) as qt_ins_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created from user as u left join user as u2 on u.id_user=u2.id_parent_user where u.id_user=' + req.session.userId + ' group by u.nm_nickname, u.nu_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created union all select t2.* from (select ' + req.session.userId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, count(u2.id_user) as qt_ins_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created from user as u left join user as u2 on u.id_user=u2.id_parent_user where u.id_user<>' + req.session.userId + ' and u.id_parent_user=' + req.session.userId;
            if (req.body.nm_cn != '')
                query += ' and u.nm_cn like ' + '\'%' + req.body.nm_cn + '%\'';
            if (req.body.nm_nickname != '')
                query += ' and u.nm_nickname like ' + '\'%' + req.body.nm_nickname + '%\'';
            if (req.body.nu_mobile != '')
                query += ' and u.nu_mobile like ' + '\'%' + req.body.nu_mobile + '%\'';
            if (req.body.id_gender != '')
                query += ' and u.id_gender = ' + '\'' + req.body.id_gender + '\'';
            if (req.body.dt_born_from != '')
                query += ' and u.dt_born >= ' + '\'' + util.formatDateDB(req.body.dt_born_from, 'mysql') + '\'';
            if (req.body.dt_born_to != '')
                query += ' and u.dt_born <= ' + '\'' + util.formatDateDB(req.body.dt_born_to, 'mysql') + '\'';
            if (req.body.qt_days_birth != '')
                query += ' and (DAYOFYEAR(curdate()) <= dayofyear(u.dt_born) and DAYOFYEAR(curdate())+' + req.body.qt_days_birth + ' >= dayofyear(u.dt_born))';
            if (req.body.nu_level_max != '')
                query += ' and u.nu_level <= ' + req.body.nu_level_max;
            if (req.body.nu_level != '')
                query += ' and u.nu_level = ' + req.body.nu_level;
            query += ' group by u.nm_nickname, u.nu_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created union all';
            query += ' select ' + req.session.userId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, 0 as qt_ins_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created from user as u inner join user as u2 on u.id_parent_user=u2.id_user where u2.id_parent_user=' + req.session.userId + ' and u2.id_user<>u2.id_parent_user';
            if (req.body.nm_cn != '')
                query += ' and u.nm_cn like ' + '\'%' + req.body.nm_cn + '%\'';
            if (req.body.nm_nickname != '')
                query += ' and u.nm_nickname like ' + '\'%' + req.body.nm_nickname + '%\'';
            if (req.body.nu_mobile != '')
                query += ' and u.nu_mobile like ' + '\'%' + req.body.nu_mobile + '%\'';
            if (req.body.id_gender != '')
                query += ' and u.id_gender = ' + '\'' + req.body.id_gender + '\'';
            if (req.body.dt_born_from != '')
                query += ' and u.dt_born >= ' + '\'' + util.formatDateDB(req.body.dt_born_from, 'mysql') + '\'';
            if (req.body.dt_born_to != '')
                query += ' and u.dt_born <= ' + '\'' + util.formatDateDB(req.body.dt_born_to, 'mysql') + '\'';
            if (req.body.qt_days_birth != '')
                query += ' and (DAYOFYEAR(curdate()) <= dayofyear(u.dt_born) and DAYOFYEAR(curdate())+' + req.body.qt_days_birth + ' >= dayofyear(u.dt_born))';
            if (req.body.nu_level_max != '')
                query += ' and u.nu_level <= ' + req.body.nu_level_max;
            if (req.body.nu_level != '')
                query += ' and u.nu_level = ' + req.body.nu_level;
            query += ' order by nm_cn) t2';
        }

        connection.query(query, function (err, rows, fields) {
            if (err) throw err;

            res.render('users-search-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Usuários - Resultado da Pesquisa', right_block_title: 'Right Menu', session: req.session, rows: rows, util: util}, function(err, html) {
                if (err) throw err;
                res.send(html);
            });
        });

        connection.end();
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });     
    }
});

// Respond to GET request to the /users/list-child/:id_user route
router.get('/list-child/:id_user', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        var connection = mysql.createConnection({
            host     : appParams.db_host,
            user     : appParams.db_user,
            password : appParams.db_password,
            database : appParams.db_database
        });
        var formParams = req.query;

        connection.connect();

        var query = 'select ' + req.session.userId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, (count(u2.id_user)-1) as qt_ins_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created from user as u left join user as u2 on u.id_user=u2.id_parent_user where u.id_user=' + req.session.userId + ' group by u.nm_nickname, u.nu_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created union all select ' + req.session.userId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, count(u2.id_user) as qt_ins_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created from user as u left join user as u2 on u.id_user=u2.id_parent_user where u.id_user=' + req.params.id_user + ' group by u.nm_nickname, u.nu_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created union all select t2.* from (select ' + req.session.userId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, count(u2.id_user) as qt_ins_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created from user as u left join user as u2 on u.id_user=u2.id_parent_user where (u.id_parent_user=' + req.params.id_user + ' and u.id_user<>' + req.session.userId + ' and u.id_user<>' + req.params.id_user + ')'
        query += ' group by u.nm_nickname, u.nu_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.nm_password, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created order by u.nm_cn) t2'

        connection.query(query, function (err, rows, fields) {
            if (err) throw err;

            res.render('users-list-child', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Usuários - Membros', right_block_title: 'Right Menu', session: req.session, rows: rows}, function(err, html) {
                if (err) throw err;
                res.send(html);
            });
        });

        connection.end();
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    }
});

// Respond to GET request to the /users/insert route
router.get('/insert', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        getUser(req.session.userId, null, false, appParams, function (err, rows, fields) {
            if (err) throw (err);

            res.render('users-insert-update', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Usuários - Inclusão', right_block_title: 'Right Menu', session: req.session, rows: rows, util: util, action: '/users/insert', method: 'POST'}, function(err, html) {
                if (err) throw err;
                res.send(html);
            });
        });
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    }
});

// Respond to POST request to the /users/insert route
router.post('/insert', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        var connection = mysql.createConnection({
            host     : appParams.db_host,
            user     : appParams.db_user,
            password : appParams.db_password,
            database : appParams.db_database
        });
        var formParams = req.query;

        connection.connect();

        var query = 'insert user (nm_email, nu_level, qt_min_members, nu_mobile, nu_tel, nm_prefix, nm_cn, nm_nickname, id_gender, dt_born, cd_city, id_parent_user, nm_password) values '
            + '(' + '\'' + req.body.nm_email + '\', '
            + (parseInt(req.body.nu_level) + 1) + ', '
            + req.body.qt_min_members + ', ' 
            + '\'' + req.body.nu_mobile + '\', '
            + '\'' + req.body.nu_tel + '\', '
            + '\'' + req.body.nm_prefix + '\', '
            + '\'' + req.body.nm_cn + '\', '
            + '\'' + req.body.nm_nickname + '\', '
            + '\'' + req.body.id_gender + '\', '
            + ((util.formatDateDB(req.body.dt_born, 'mysql')=='') ? 'null, ' : '\'' + util.formatDateDB(req.body.dt_born, 'mysql') + '\', ')
            + req.body.cd_city + ', '
            + req.session.userId + ', '
            + '\'' + util.randomEncrypt(appParams.crypto_algorithm, appParams.crypto_encryption_key, appParams.crypto_iv_length, req.body.nu_mobile.substr(req.body.nu_mobile.length-4, 4)) + '\''
            + ')';

        connection.query(query, function (err, rows, fields) {
            //if (err) throw err;
            if (err) {
                res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: err.message /*'Houston: we have a problem. Check the input data and try again.'*/, right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                    if (err) throw err;
                    res.send(html);
                });
            } else {
                if (rows.affectedRows==1) {
                    res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Usuário incluído.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                        if (err) throw err;
                        res.send(html);
                        // Send message to user of level less then 2
                        if ((parseInt(req.body.nu_level) + 1) <= 2 && req.body.nm_email != '') {
                            var mailTo = req.body.nm_email;
                            // Define subject and html message
                            var subject = 'Hi! Welcome to USC.';
                            var htmlMessage = ''
                            + '<center>'
                            + '<h1>Olá, '
                            + req.body.nm_nickname
                            + '!<h1>'
                            + '<p></p>'
                            + '<p><b>Welcome to USC.</b></p>'
                            + '<p>Users - Tree View Model.</p>'
                            + '</center>'
                            + '<p></p>'
                            + '<p>My name is '
                            + req.session.userNickname
                            + '.</p>'
                            + '<p></p>'
                            + '<p>'
                            + 'We have created this site to help you connect to friends.</p>'
                            + '<p>'
                            + 'Accessing the site is simple and can be done through the browser of your mobile phone, too.'
                            + '</p>'
                            + '<p>'
                            + 'Access https://www.USC.???, inform your mobile number (nn nnnnn-nnnn). Your initil password are the last 4 digits of you mobile number.'
                            + ' Signed in, you will see options for changing your password, inserting new users under yours and search people under your tree node.'
                            + '</p>'
                            + '<p></p>'
                            + '<center>'
                            + '<img src=https://www.USC.com.br/images/img_tree.png></img>'
                            + '</center>';
                            // Create reusable transporter object using the default SMTP transport
                            let transporter = nodemailer.createTransport({
                                host: appParams.nodemailer_host,
                                port: appParams.nodemailer_port,
                                secure: false, // true for 465, false for other ports
                                auth: {
                                    user: appParams.nodemailer_user,
                                    pass: appParams.nodemailer_password
                                }
                            });
                            // Setup email data with unicode symbols
                            let mailOptions = {
                                from: appParams.nodemailer_user_description + ' <' + appParams.nodemailer_user + '>', // sender address
                                to: mailTo, // list of receivers
                                subject: subject, // subject line
                                //text: req.body.dc_message, // plain text body
                                html: htmlMessage, // html body
                                attachments: [
                                ]                        
                            };
                            // send mail with defined transport object
                            transporter.sendMail(mailOptions, (err, info) => {
                                if (err) throw err;
                            });
                            transporter.close();
                        }
                    });
                }
                else {
                    res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Houston: we have a problem. Check the input data and try again.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                        if (err) throw err;
                        res.send(html);
                    });
                }      
            }
        });

        connection.end();
        //setTimeout(res.sendFile( __dirname + "/" + "update-users.html" ), 2000);
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        }); 
    }
});

// Respond to GET request to the /users/update/:id_user route
router.get('/update/:id_user', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        getUser(req.session.userId, req.params.id_user, true, appParams, function (err, rows, fields) {
            if (err) throw (err);

            res.render('users-insert-update', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Usuário - Alteração', right_block_title: 'Right Menu', session: req.session, rows: rows, util: util, action: '/users/update', method: 'POST'}, function(err, html) {
                if (err) throw err;
                res.send(html);
            });
        });
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    }
});

// Respond to POST/PUT request to the /users/update route
router.post('/update', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        var connection = mysql.createConnection({
            host     : appParams.db_host,
            user     : appParams.db_user,
            password : appParams.db_password,
            database : appParams.db_database
        });
        var formParams = req.query;

        connection.connect();

        var query = 'update user as u set '
            + 'u.nm_email=' + '\'' + req.body.nm_email + '\', '
            + 'u.nu_level=' + req.body.nu_level + ', '
            + 'u.qt_min_members=' + req.body.qt_min_members + ', ' 
            + 'u.nu_mobile=' + '\'' + req.body.nu_mobile + '\', '
            + 'u.nu_tel=' + '\'' + req.body.nu_tel + '\', '
            + 'u.nm_prefix=' + '\'' + req.body.nm_prefix + '\', ' 
            + 'u.nm_cn=' + '\'' + req.body.nm_cn + '\', '
            + 'u.nm_nickname=' + '\'' + req.body.nm_nickname + '\', '
            + 'u.id_gender=' + '\'' + req.body.id_gender + '\', '
            + 'u.dt_born=' + ((util.formatDateDB(req.body.dt_born, 'mysql')=='') ? 'null, ' : '\'' + util.formatDateDB(req.body.dt_born, 'mysql') + '\', ')
            + 'u.cd_city=' + req.body.cd_city + ', '
            + 'u.id_parent_user=' + req.body.id_parent_user + ''
            + ' where u.id_user=' + req.body.id_user;

        connection.query(query, function (err, rows, fields) {
            //if (err) throw err;
            if (err) {
                res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: err.message /*'Houston: we have a problem. Check the input data and try again.'*/, right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                    if (err) throw err;
                    res.send(html);
                });
            } else {
                if (rows.affectedRows==1) {
                    res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Usuário alterado.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                        if (err) throw err;
                        res.send(html);
                    });
                }
                else {
                    res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Houston: we have a problem. Check the input data and try again.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                        if (err) throw err;
                        res.send(html);
                    });
                }
            }
        });

        //connection.query('update user as u set u.nm_email, u.nu_level, u.qt_min_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.id_gender, u.dt_born, cd_city, u.id_parent_user, u.dt_created where u.user.id_user=' + req.params.id, function (err, rows, fields) {
        // Prepare output in JSON format
        var response = {
            nm_email: req.query.nm_email,
            nm_cn: req.query.nm_cn
        };
        //res.end(JSON.stringify(formParams));
        //res.end(JSON.stringify(response));

        connection.end();
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    }
});

// Respond to GET request to the /users/delete/:id_user route
router.get('/delete/:id_user', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        getUser(req.session.userId, req.params.id_user, true, appParams, function (err, rows, fields) {
            if (err) throw (err);

            res.render('users-delete', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'User - Deleting', right_block_title: 'Right Menu', session: req.session, rows: rows, action: '/users/delete', method: 'POST'}, function(err, html) {
                if (err) throw err;
                res.send(html);
            });
        });
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    }
});

// Respond to POST/PUT request to the /users/delete route
router.post('/delete', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        var connection = mysql.createConnection({
            host     : appParams.db_host,
            user     : appParams.db_user,
            password : appParams.db_password,
            database : appParams.db_database
        });
        var formParams = req.query;

        if (req.body.action == 'confirm') {
            connection.connect();

            var query = 'delete from user where id_user=' + req.body.id_user

            connection.query(query, function (err, rows, fields) {
                //if (err) throw err;
                if (err) {
                    res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: err.message /*'Houston: we have a problem. Check the input data and try again.'*/, right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                        if (err) throw err;
                        res.send(html);
                    });
                } else {
                    if (rows.affectedRows==1) {
                        res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'User deleted.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                            if (err) throw err;
                            res.send(html);
                        });
                    }
                    else {
                        res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Houston: we have a problem. Check the input data and try again.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                            if (err) throw err;
                            res.send(html);
                        });
                    }
                }
            });

            connection.end();
        }
        else {
            res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'User not deleted.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                if (err) throw err;
                res.send(html);
            });
        }
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    }
});

// Respond to GET request to the /users/send-message route
router.get('/send-message', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        getUser(req.session.userId, null, false, appParams, function (err, rows, fields) {
            if (err) throw (err);

            res.render('users-send-message', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Users - Send Message', right_block_title: 'Right Menu', session: req.session, rows: rows, action: '/users/send-message', method: 'POST'}, function(err, html) {
                if (err) throw err;
                res.send(html);
            });
        });
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    }
});

// Respond to POST/PUT request to the /users/send-message route
router.post('/send-message', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        var connection = mysql.createConnection({
            host     : appParams.db_host,
            user     : appParams.db_user,
            password : appParams.db_password,
            database : appParams.db_database
        });
        var formParams = req.query;

        connection.connect();

        if (req.session.userLevel==0) { // Master
            var query = 'select ' + req.session.userId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.id_parent_user, ' + ((req.body.nm_cn=='') ? '\'\'' : '\'' + req.body.nm_cn + '\'') + ' as nm_cn, ' + ((req.body.nm_nickname=='') ? '\'\'' : '\'' + req.body.nm_nickname + '\'') + ' as nm_nickname, ' + ((req.body.nu_mobile=='') ? '\'\'' : '\'' + req.body.nu_mobile + '\'') + ' as nu_mobile, ' + ((req.body.id_gender=='') ? '\'\'' : '\'' + req.body.id_gender + '\'') + ' as id_gender, ' + ((req.body.dt_born_from=='') ? '\'\'' : '\'' + req.body.dt_born_from + '\'') + ' as dt_born_from, ' + ((req.body.dt_born_to=='') ? '\'\'' : '\'' + req.body.dt_born_to + '\'') + ' as dt_born_to, ' + ((req.body.qt_days_birth=='') ? '\'\'' : req.body.qt_days_birth) + ' as qt_days_birth, ' + ((req.body.nu_level_max=='') ? '\'\'' : req.body.nu_level_max) + ' as nu_level_max, ' + ((req.body.nu_level=='') ? '\'\'' : req.body.nu_level) + ' as nu_level, \'' + req.body.nm_send_method + '\' as nm_send_method, \'' + req.body.dc_subject + '\' as dc_subject, \'' + req.body.dc_message + '\' as dc_message, (count(u2.id_user)+1) as qt_result from user as u, user as u2 where u.id_user=' + req.session.userId + ' and u2.id_user<>' + req.session.userId 
            if (req.body.nm_cn != '')
                query += ' and u2.nm_cn like ' + '\'%' + req.body.nm_cn + '%\'';
            if (req.body.nm_nickname != '')
                query += ' and u2.nm_nickname like ' + '\'%' + req.body.nm_nickname + '%\'';
            if (req.body.nu_mobile != '')
                query += ' and u2.nu_mobile like ' + '\'%' + req.body.nu_mobile + '%\'';
            if (req.body.id_gender != '')
                query += ' and u2.id_gender = ' + '\'' + req.body.id_gender + '\'';
            if (req.body.dt_born_from != '')
                query += ' and u2.dt_born >= ' + '\'' + util.formatDateDB(req.body.dt_born_from, 'mysql') + '\'';
            if (req.body.dt_born_to != '')
                query += ' and u2.dt_born <= ' + '\'' + util.formatDateDB(req.body.dt_born_to, 'mysql') + '\'';
            if (req.body.qt_days_birth != '')
                query += ' and (DAYOFYEAR(curdate()) <= dayofyear(u2.dt_born) and DAYOFYEAR(curdate())+' + req.body.qt_days_birth + ' >= dayofyear(u2.dt_born))';
            if (req.body.nu_level_max != '')
                query += ' and u2.nu_level <= ' + req.body.nu_level_max;
            if (req.body.nu_level != '')
                query += ' and u2.nu_level = ' + req.body.nu_level;
        } else {
            var query = 'select t2.id_logged_user, t2.user_nickname, t2.user_level, t2.id_user, t2.id_parent_user, t2.nm_cn, t2.nm_nickname, t2.nu_mobile, t2.id_gender, t2.dt_born_from, t2.dt_born_to, t2.qt_days_birth, t2.nu_level_max, t2.nm_send_method, t2.dc_subject, t2.dc_message, (sum(t2.qt_result)+1) as qt_result from';
            query += ' (select ' + req.session.userId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.id_parent_user, ' + ((req.body.nm_cn=='') ? '\'\'' : '\'' + req.body.nm_cn + '\'') + ' as nm_cn, ' + ((req.body.nm_nickname=='') ? '\'\'' : '\'' + req.body.nm_nickname + '\'') + ' as nm_nickname, ' + ((req.body.nu_mobile=='') ? '\'\'' : '\'' + req.body.nu_mobile + '\'') + ' as nu_mobile, ' + ((req.body.id_gender=='') ? '\'\'' : '\'' + req.body.id_gender + '\'') + ' as id_gender, ' + ((req.body.dt_born_from=='') ? '\'\'' : '\'' + req.body.dt_born_from + '\'') + ' as dt_born_from, ' + ((req.body.dt_born_to=='') ? '\'\'' : '\'' + req.body.dt_born_to + '\'') + ' as dt_born_to, ' + ((req.body.qt_days_birth=='') ? '\'\'' : req.body.qt_days_birth) + ' as qt_days_birth, ' + ((req.body.nu_level_max=='') ? '\'\'' : req.body.nu_level_max) + ' as nu_level_max, ' + ((req.body.nu_level=='') ? '\'\'' : req.body.nu_level) + ' as nu_level, \'' + req.body.nm_send_method + '\' as nm_send_method, \'' + req.body.dc_subject + '\' as dc_subject, \'' + req.body.dc_message + '\' as dc_message, count(u2.id_user) as qt_result from user as u left join user as u2 on u.id_user=u2.id_parent_user where u.id_user=' + req.session.userId;
            if (req.body.nm_cn != '')
                query += ' and u2.nm_cn like ' + '\'%' + req.body.nm_cn + '%\'';
            if (req.body.nm_nickname != '')
                query += ' and u2.nm_nickname like ' + '\'%' + req.body.nm_nickname + '%\'';
            if (req.body.nu_mobile != '')
                query += ' and u2.nu_mobile like ' + '\'%' + req.body.nu_mobile + '%\'';
            if (req.body.id_gender != '')
                query += ' and u2.id_gender = ' + '\'' + req.body.id_gender + '\'';
            if (req.body.dt_born_from != '')
                query += ' and u2.dt_born >= ' + '\'' + util.formatDateDB(req.body.dt_born_from, 'mysql') + '\'';
            if (req.body.dt_born_to != '')
                query += ' and u2.dt_born <= ' + '\'' + util.formatDateDB(req.body.dt_born_to, 'mysql') + '\'';
            if (req.body.qt_days_birth != '')
                query += ' and (DAYOFYEAR(curdate()) <= dayofyear(u2.dt_born) and DAYOFYEAR(curdate())+' + req.body.qt_days_birth + ' >= dayofyear(u2.dt_born))';
            if (req.body.nu_level_max != '')
                query += ' and u2.nu_level <= ' + req.body.nu_level_max;
            if (req.body.nu_level != '')
                query += ' and u2.nu_level = ' + req.body.nu_level;
            query += ' union all select ' + req.session.userId + ' as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.id_parent_user, ' + ((req.body.nm_cn=='') ? '\'\'' : '\'' + req.body.nm_cn + '\'') + ' as nm_cn, ' + ((req.body.nm_nickname=='') ? '\'\'' : '\'' + req.body.nm_nickname + '\'') + ' as nm_nickname, ' + ((req.body.nu_mobile=='') ? '\'\'' : '\'' + req.body.nu_mobile + '\'') + ' as nu_mobile, ' + ((req.body.id_gender=='') ? '\'\'' : '\'' + req.body.id_gender + '\'') + ' as id_gender, ' + ((req.body.dt_born_from=='') ? '\'\'' : '\'' + req.body.dt_born_from + '\'') + ' as dt_born_from, ' + ((req.body.dt_born_to=='') ? '\'\'' : '\'' + req.body.dt_born_to + '\'') + ' as dt_born_to, ' + ((req.body.qt_days_birth=='') ? '\'\'' : req.body.qt_days_birth) + ' as qt_days_birth, ' + ((req.body.nu_level_max=='') ? '\'\'' : req.body.nu_level_max) + ' as nu_level_max, ' + ((req.body.nu_level=='') ? '\'\'' : req.body.nu_level) + ' as nu_level, \'' + req.body.nm_send_method + '\' as nm_send_method, \'' + req.body.dc_subject + '\' as dc_subject, \'' + req.body.dc_message + '\' as dc_message, count(u3.id_user) as qt_result from user as u left join user as u2 on u.id_user=u2.id_parent_user left join user as u3 on u2.id_user=u3.id_parent_user where u.id_user=' + req.session.userId;
            if (req.body.nm_cn != '')
                query += ' and u3.nm_cn like ' + '\'%' + req.body.nm_cn + '%\'';
            if (req.body.nm_nickname != '')
                query += ' and u3.nm_nickname like ' + '\'%' + req.body.nm_nickname + '%\'';
            if (req.body.nu_mobile != '')
                query += ' and u3.nu_mobile like ' + '\'%' + req.body.nu_mobile + '%\'';
            if (req.body.id_gender != '')
                query += ' and u3.id_gender = ' + '\'' + req.body.id_gender + '\'';
            if (req.body.dt_born_from != '')
                query += ' and u3.dt_born >= ' + '\'' + util.formatDateDB(req.body.dt_born_from, 'mysql') + '\'';
            if (req.body.dt_born_to != '')
                query += ' and u3.dt_born <= ' + '\'' + util.formatDateDB(req.body.dt_born_to, 'mysql') + '\'';
            if (req.body.qt_days_birth != '')
                query += ' and (DAYOFYEAR(curdate()) <= dayofyear(u3.dt_born) and DAYOFYEAR(curdate())+' + req.body.qt_days_birth + ' >= dayofyear(u3.dt_born))';
            if (req.body.nu_level_max != '')
                query += ' and u3.nu_level <= ' + req.body.nu_level_max;
            if (req.body.nu_level != '')
                query += ' and u3.nu_level = ' + req.body.nu_level;
            query += ') t2 group by t2.id_logged_user, t2.user_nickname, t2.user_level, t2.id_user, t2.id_parent_user, t2.nm_cn, t2.nm_nickname, t2.nu_mobile, t2.id_gender, t2.dt_born_from, t2.dt_born_to, t2.qt_days_birth, t2.nu_level_max, t2.nm_send_method, t2.dc_subject, t2.dc_message'
        }

        connection.query(query, function (err, rows, fields) {
            if (err) throw err;

            res.render('users-send-message-confirm', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Users - Send Message Confirmation', right_block_title: 'Right Menu', session: req.session, rows: rows, action: '/users/send-message-confirm', method: 'POST'}, function(err, html) {
                if (err) throw err;
                res.send(html);
            });
        });

        connection.end();
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });
    }
});

// Respond to POST/PUT request to the /users/send-message-confirm route
router.post('/send-message-confirm', function(req, res, next) {
    if (req.session.userId) {
        var appParams = req.app.locals.appParams;
        var connection = mysql.createConnection({
            host     : appParams.db_host,
            user     : appParams.db_user,
            password : appParams.db_password,
            database : appParams.db_database
        });
        var formParams = req.query;

        /*rows2 = [{
            id_logged_user: req.body.id_logged_user,
            user_nickname: req.body.user_nickname,
            user_level: req.body.user_level,
            id_user: req.body.id_user,
            id_parent_user: req.body.id_parent_user
        }];*/

        if (req.body.action == 'confirm') {
            connection.connect();
            if (req.session.userLevel==0) {
                var query = 'select u.nm_cn, u.nm_nickname, u.nu_mobile, u.nm_email from user as u where u.nm_email<>\'\' and u.id_user=' + req.session.userId + ' union all select u2.nm_cn, u2.nm_nickname, u2.nu_mobile, u2.nm_email from user as u2 where u2.nm_email<>\'\' and u2.id_user<>' + req.session.userId
                if (req.body.nm_cn != '')
                    query += ' and u2.nm_cn like ' + '\'%' + req.body.nm_cn + '%\'';
                if (req.body.nm_nickname != '')
                    query += ' and u2.nm_nickname like ' + '\'%' + req.body.nm_nickname + '%\'';
                if (req.body.nu_mobile != '')
                    query += ' and u2.nu_mobile like ' + '\'%' + req.body.nu_mobile + '%\'';
                if (req.body.id_gender != '')
                    query += ' and u2.id_gender = ' + '\'' + req.body.id_gender + '\'';
                if (req.body.dt_born_from != '')
                    query += ' and u2.dt_born >= ' + '\'' + util.formatDateDB(req.body.dt_born_from, 'mysql') + '\'';
                if (req.body.dt_born_to != '')
                    query += ' and u2.dt_born <= ' + '\'' + util.formatDateDB(req.body.dt_born_to, 'mysql') + '\'';
                if (req.body.qt_days_birth != '')
                    query += ' and (DAYOFYEAR(curdate()) <= dayofyear(u2.dt_born) and DAYOFYEAR(curdate())+' + req.body.qt_days_birth + ' >= dayofyear(u2.dt_born))';
                if (req.body.nu_level_max != '')
                    query += ' and u2.nu_level <= ' + req.body.nu_level_max;
                if (req.body.nu_level != '')
                    query += ' and u2.nu_level = ' + req.body.nu_level;
            } else {
                var query = 'select u.nm_cn, u.nm_nickname, u.nu_mobile, u.nm_email from user as u where u.nm_email<>\'\' and u.id_user=' + req.session.userId + ' union all select u2.nm_cn, u2.nm_nickname, u2.nu_mobile, u2.nm_email from user as u left join user as u2 on u.id_user=u2.id_parent_user where u2.nm_email<>\'\' and u.id_user=' + req.session.userId
                if (req.body.nm_cn != '')
                    query += ' and u2.nm_cn like ' + '\'%' + req.body.nm_cn + '%\'';
                if (req.body.nm_nickname != '')
                    query += ' and u2.nm_nickname like ' + '\'%' + req.body.nm_nickname + '%\'';
                if (req.body.nu_mobile != '')
                    query += ' and u2.nu_mobile like ' + '\'%' + req.body.nu_mobile + '%\'';
                if (req.body.id_gender != '')
                    query += ' and u2.id_gender = ' + '\'' + req.body.id_gender + '\'';
                if (req.body.dt_born_from != '')
                    query += ' and u2.dt_born >= ' + '\'' + util.formatDateDB(req.body.dt_born_from, 'mysql') + '\'';
                if (req.body.dt_born_to != '')
                    query += ' and u2.dt_born <= ' + '\'' + util.formatDateDB(req.body.dt_born_to, 'mysql') + '\'';
                if (req.body.qt_days_birth != '')
                    query += ' and (DAYOFYEAR(curdate()) <= dayofyear(u2.dt_born) and DAYOFYEAR(curdate())+' + req.body.qt_days_birth + ' >= dayofyear(u2.dt_born))';
                if (req.body.nu_level_max != '')
                    query += ' and u2.nu_level <= ' + req.body.nu_level_max;
                if (req.body.nu_level != '')
                    query += ' and u2.nu_level = ' + req.body.nu_level;
                query += ' union all select u3.nm_cn, u3.nm_nickname, u3.nu_mobile, u3.nm_email from user as u left join user as u2 on u.id_user=u2.id_parent_user left join user as u3 on u2.id_user=u3.id_parent_user where u3.nm_email<>\'\' and u.id_user=' + req.session.userId
                if (req.body.nm_cn != '')
                    query += ' and u3.nm_cn like ' + '\'%' + req.body.nm_cn + '%\'';
                if (req.body.nm_nickname != '')
                    query += ' and u3.nm_nickname like ' + '\'%' + req.body.nm_nickname + '%\'';
                if (req.body.nu_mobile != '')
                    query += ' and u3.nu_mobile like ' + '\'%' + req.body.nu_mobile + '%\'';
                if (req.body.id_gender != '')
                    query += ' and u3.id_gender = ' + '\'' + req.body.id_gender + '\'';
                if (req.body.dt_born_from != '')
                    query += ' and u3.dt_born >= ' + '\'' + util.formatDateDB(req.body.dt_born_from, 'mysql') + '\'';
                if (req.body.dt_born_to != '')
                    query += ' and u3.dt_born <= ' + '\'' + util.formatDateDB(req.body.dt_born_to, 'mysql') + '\'';
                if (req.body.qt_days_birth != '')
                    query += ' and (DAYOFYEAR(curdate()) <= dayofyear(u3.dt_born) and DAYOFYEAR(curdate())+' + req.body.qt_days_birth + ' >= dayofyear(u3.dt_born))';
                if (req.body.nu_level_max != '')
                    query += ' and u3.nu_level <= ' + req.body.nu_level_max;
                if (req.body.nu_level != '')
                    query += ' and u3.nu_level = ' + req.body.nu_level;
            }

            connection.query(query, function (err, rows, fields) {
                if (err) throw err;

                switch (req.body.nm_send_method) {
                    case 'email':
                        // Prepare list of receivers
                        var mailTo = rows[0].nm_email;
                        for (var i=1; i<rows.length; i++) {
                            mailTo += (', ' + rows[i].nm_email)
                        }
                        // Create reusable transporter object using the default SMTP transport
                        let transporter = nodemailer.createTransport({
                            host: appParams.nodemailer_host,
                            port: appParams.nodemailer_port,
                            secure: false, // true for 465, false for other ports
                            auth: {
                                user: appParams.nodemailer_user,
                                pass: appParams.nodemailer_password
                            }
                        });
                        // Setup email data with unicode symbols
                        let mailOptions = {
                            from: appParams.nodemailer_user_description + ' <' + appParams.nodemailer_user + '>', // sender address
                            to: mailTo, // list of receivers
                            subject: req.body.dc_subject, // subject line
                            //text: req.body.dc_message, // plain text body
                            html: req.body.dc_message, // html body
                            attachments: [
                                // String attachment
                    
                                // Binary Buffer attachment

                                // File Stream attachment
                            ]                        
                        };
                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (err, info) => {
                            if (err) throw err;
                        });
                        transporter.close();
                        break;
                    case 'sms':
                        break;
                    case 'whatsapp':
                        break;
                    default:
                        break;
                };

                if (rows.length>=1) {
                    res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Message Sent. Only valid e-mails and mobile numbers will receive the message.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                        if (err) throw err;
                        res.send(html);
                    });
                }
                else {
                    res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Houston: we have a problem. Check the input data and try again.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                        if (err) throw err;
                        res.send(html);
                    });
                }      
            });

            connection.end();
        }
        else {
            res.render('users-general-operation-result', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Message not sent.', right_block_title: 'Right Menu', session: req.session}, function(err, html) {
                if (err) throw err;
                res.send(html);
            });
        }
    } else {
        res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
        });  
    }
});

module.exports = router;
