var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'USC', top_block_title: 'Users - Tree View Model.', left_block_title: '', center_block_title: 'Welcome to USC!', right_block_title: 'Right Menu'}, function(err, html) {
    if (err) throw err;
    res.send(html);
  });
});

module.exports = router;
