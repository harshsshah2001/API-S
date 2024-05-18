const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const mailer = require('../helpers/mailer');

const userRegister = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation Errors',
                errors: errors.array()
            });
        }

        const { name, email, mobile, password } = req.body;
        const isExists = await User.findOne({ email });
        if (isExists) {
            return res.status(400).json({
                success: false,
                msg: 'Email Already Exists'
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            mobile,
            password: hashPassword,
            image: 'images/' + req.file.filename
        });
        const userData = await user.save();

        const msg = `<p>Hi ${name}, please verify your account by clicking the link below:</p>
                     <p><a href="http://localhost:3000/mail-verification?id=${userData._id}">Verify Email</a></p>`;
        await mailer.sendMail('Mail Verification', msg, email);

        return res.status(200).json({
            success: true,
            msg: 'Registered Successfully',
            user: userData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

const mailverification = async (req, res) => {
    try {
        const userId = req.query.id;
        if (!userId) {
            return res.render('404');
        }

        const userData = await User.findOne({ _id: userId });
        if (userData) {
            if (userData.is_verified) {
                return res.render('mail-verification', { message: "Your email has already been verified successfully." });
            }

            await User.findByIdAndUpdate(userId, {
                $set: {
                    is_verified: true
                }
            });

            return res.render('mail-verification', { message: "Your email has been verified successfully." });
        } else {
            return res.render('mail-verification', { message: "User not found." });
        }
    } catch (error) {
        console.log(error.message);
        return res.render('404');
    }
};
const sendMailVerification=async(req,res)=>{
    try {
        
        const errors=validationResult(req);
        if(!errors.isEmpty())
{
    return res.status(400).json({
        MSG:'Errors',
        errors:errors.array()
    })
}

    const{email}= req.body
    const userData = await  User.findOne({email});
    if(!userData){
        return res.status(400).json({
            success:false,
            msg:"Email Does Not Exits"
        })
    }
    if(userData.is_verified == 1){
        return res.status(400).json({
            success:false,
            msg:userData.email+"Mail is Already Verified"
        })
    }
    const msg = `<p>Hi ${userData.name}, please verify your account by clicking the link below:</p>
    <p><a href="http://localhost:3000/mail-verification?id=${userData._id}">Verify Email</a></p>`;
await mailer.sendMail('Mail Verification', msg, email);

return res.status(200).json({
success: true,
msg: 'Verification Link Sent To Your Mail,Please Check',
user: userData
});
    } catch (error) {
        return res.status(400).json({
            success:false,
            msg:error.message
        })
    }
}
module.exports = { userRegister, mailverification,sendMailVerification };
