const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/heavy-sync', testController.heavySync);
router.get('/heavy-async', testController.heavyAsync);

module.exports = router;