const express = require('express');
const router = express.Router();

const userController = require('../conrollers/controller'); // Fixed typo in the path
const bodyParser=require('body-parser')
router.use(express.json());
router.use(bodyParser.urlencoded({extended:true}))
// const bodyParser = require('body-parser');

router.get('/mail-verification',userController.mailverification)
router.get('/reset-password',userController.resetPassword)
router.post('/reset-password',userController.updatePassword)
router.get('/reset-success',userController.resetSuccess)


module.exports = router;




