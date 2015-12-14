var express = require('express');
var router = express.Router();

var dateIdeasCtrl = require('../controllers/dateIdeas');


router.put('/grabPage/:urlString' , dateIdeasCtrl.grabPage );
router.put('/specificTVLink/:show/:season/:episode' , dateIdeasCtrl.specificTVLink );
router.put('/hostProvider/:showID' , dateIdeasCtrl.hostProvider );
router.put('/getMP4URL/' , dateIdeasCtrl.getMP4URL );

module.exports = router;


