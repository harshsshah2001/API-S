const { check } = require("express-validator");

exports.registerValidator = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
    check('mobile', 'Mobile Number should be 10 digits').isLength({
        min: 10,
        max: 10
    }),
    check('password', 'Password must be greater than 6 characters').isStrongPassword({
        minLength: 6,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 2
    }),
    check('image').custom((value, { req }) => {
        if (req.file && (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png')) {
            return true;
        } else {
            return false;
        }
    }).withMessage('Please upload an image JPG or PNG')
];
