const express = require('express');
const multer = require('multer');
const router = express.Router();
const userController = require('../conrollers/controller'); // Fixed typo in the path
router.use(express.json());
const path = require('path');
const {registerValidator,sendMailVerificationValidator, passwordResetValidator,loginValidator}=require('../helpers/validation');

const storage = multer.diskStorage({

    destination: function(req, file, cb) {
        // Check The File type JPG or PNG if file Type Valid Then Go
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'png'){
        cb(null, path.join(__dirname, '../public/images'));
    }
    },
    filename: (req, file, cb) => {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const fileFilter=(req,file,cv)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'png'){
        cv(null,true);
    }
    else{
        cv(null,false)
    }
}

const upload = multer({ 
    storage: storage,
    fileFilter:fileFilter
 });
 // Multer is over
 
// Ensure that userRegister is correctly defined and exported from the controller
router.post('/register', upload.single('image'),registerValidator, userController.userRegister);
router.post('/send-mail-verification',sendMailVerificationValidator,userController.sendMailVerification)
router.post('/forgot-password',passwordResetValidator,userController.forgotPassword)
router.post('/login',loginValidator,userController.loginUser)

module.exports = router;
 