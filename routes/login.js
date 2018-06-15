const express = require('express');
const mysql = require('mysql');
const Util = require('../public/javascripts/util');

const router = express.Router();

var util = new Util();

// Respond to GET request to the /login route
router.get('/', function(req, res, next) {
  //var appParams = req.app.locals.appParams;
  res.render('login', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Login', right_block_title: 'Right Menu'}, function(err, html) {
    if (err) throw err;
    res.send(html);
  });
});

// Respond to POST request to the /login route
router.post('/', function(req, res, next) {
    //console.log(req.baseUrl.toString())
    //console.log(JSON.stringify(req.body))
    var appParams = req.app.locals.appParams;
    var connection = mysql.createConnection({
        host     : appParams.db_host,
        port     : appParams.db_port,
        user     : appParams.db_user,
        password : appParams.db_password,
        database : appParams.db_database
    });

    var login = req.body.nu_mobile;
    var password = req.body.nm_password;

    connection.connect();
    connection.query('select u.id_user as id_logged_user, u.nm_nickname as user_nickname, u.nu_level as user_level, u.id_user, u.nm_email, u.nm_password, u.nu_level, u.qt_min_members, case when u.nu_level=0 then (count(u2.id_user)-1) else count(u2.id_user) end as qt_ins_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created from user as u left join user as u2 on u.id_user=u2.id_parent_user where u.nu_level<=2 and u.nu_mobile=\'' + login + '\' group by u.nm_nickname, u.nu_level, u.id_user, u.nm_email, u.nu_level, u.qt_min_members, u.nu_mobile, u.nu_tel, u.nm_prefix, u.nm_cn, u.nm_nickname, u.id_gender, u.dt_born, u.cd_city, u.id_parent_user, u.dt_created', function (err, rows, fields) {
        if (err) throw err;

        //if (rows.length==1 && password==login.substr(login.length-4, 4)) {
        if (rows.length==1 && password==util.randomDecrypt(appParams.crypto_algorithm, appParams.crypto_encryption_key, rows[0].nm_password)) {
          req.session.userId = rows[0].id_logged_user;
          req.session.userNickname = rows[0].user_nickname;
          req.session.userLevel = rows[0].user_level;

          res.render('users-list', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: 'Menu', center_block_title: 'Users - Your Data', right_block_title: 'Right Menu', session: req.session, rows: rows, util: util}, function(err, html) {
              if (err) throw err;
              res.send(html);
          });
        } 
        else {
          req.session.userId = null;
          req.session.userNickname = null;
          req.session.userLevel = null;

          res.render('login', {title: 'USC', top_block_title: 'Users - Tree View Model', left_block_title: 'Menu', center_block_title: 'Houston: we have a problem. Try again.', right_block_title: 'Right Menu'}, function(err, html) {
            if (err) throw err;
            res.send(html);
          });
        }
    });

    connection.end();

});

module.exports = router;
