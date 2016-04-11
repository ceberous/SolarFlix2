var express = require('express');
var router = express.Router();

var dateIdeasCtrl = require('../controllers/dateIdeas');

router.put('/grabSolarMovieTVSHOW/:urlString' , dateIdeasCtrl.grabSolarMovieTVSHOW );
router.put('/specificEpisodeLink/:show/:season/:episode' , dateIdeasCtrl.specificEpisodeLink );
router.put('/parseProvider/:obJectURL' , dateIdeasCtrl.parseProvider );


module.exports = router;


