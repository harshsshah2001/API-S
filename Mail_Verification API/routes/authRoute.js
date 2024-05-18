const express = require('express');
const router = express.Router();

router.use(express.json());

const userController = require('../conrollers/controller'); // Fixed typo in the path

router.get('/mail-verification',userController.mailverification)

module.exports = router;