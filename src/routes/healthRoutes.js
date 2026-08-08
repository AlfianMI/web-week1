const express = require('express');
const HealthController = require('../controllers/healthController');

const router = express.Router();

router.get('/', HealthController.getBasicHealth);
router.get('/deep', HealthController.getDeepHealth);

module.exports = router;
