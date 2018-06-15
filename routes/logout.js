var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) throw err;
  });

  res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Bem vindo ao Arvorez!', right_block_title: 'Right Menu', appParams: req.app.locals.appParams}, function(err, html) {
    if (err) throw err;
    res.send(html);
  });
});

module.exports = router;
