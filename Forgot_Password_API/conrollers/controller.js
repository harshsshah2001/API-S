const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const mailer = require('../helpers/mailer');
const randomestring = require('randomstring');
const PasswordReset = require('../models/passwordReset');
const jwt = require('jsonwebtoken')

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
                msg: 'Email already exists'
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            mobile,
            password: hashPassword,
            image: req.file ? 'images/' + req.file.filename : null
        });
        const userData = await user.save();

        const msg = `<p>Hi ${name}, please verify your account by clicking the link below:</p>
                     <p><a href="http://localhost:3000/mail-verification?id=${userData._id}">Verify Email</a></p>`;
        await mailer.sendMail('Mail Verification', msg, email);

        return res.status(200).json({
            success: true,
            msg: 'Registered successfully',
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
            return res.status(404).render('404');
        }

        const userData = await User.findOne({ _id: userId });
        if (userData) {
            if (userData.is_verified) {
                return res.render('mail-verification', { message: "Your email has already been verified successfully." });
            }

            await User.findByIdAndUpdate(userId, {
                $set: { is_verified: true }
            });

            return res.render('mail-verification', { message: "Your email has been verified successfully." });
        } else {
            return res.render('mail-verification', { message: "User not found." });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).render('404');
    }
};

const sendMailVerification = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation Errors',
                errors: errors.array()
            });
        }

        const { email } = req.body;
        const userData = await User.findOne({ email });
        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: "Email does not exist"
            });
        }
        if (userData.is_verified) {
            return res.status(400).json({
                success: false,
                msg: `${userData.email} is already verified`
            });
        }

        const msg = `<p>Hi ${userData.name}, please verify your account by clicking the link below:</p>
                     <p><a href="http://localhost:3000/mail-verification?id=${userData._id}">Verify Email</a></p>`;
        await mailer.sendMail('Mail Verification', msg, email);

        return res.status(200).json({
            success: true,
            msg: 'Verification link sent to your email. Please check.',
            user: userData
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Validation Errors',
                errors: errors.array()
            });
        }

        const { email } = req.body;
        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: "Email doesn't exist"
            });
        }

        const randomString = randomestring.generate();
        const msg = `<p>Hi ${userData.name}, please click <a href="http://localhost:3000/reset-password?token=${randomString}">here</a> to reset your password.</p>`;
        
        const passwordReset = new PasswordReset({
            user_id: userData._id,
            token: randomString
        });
        await passwordReset.save();
        await mailer.sendMail('Reset Password', msg, email);

        return res.status(201).json({
            success: true,
            msg: 'Reset password link sent to your email. Please check.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        if (!req.query.token) {
            return res.status(404).render('404');
        }

        const resetData = await PasswordReset.findOne({ token: req.query.token });
        if (!resetData) {
            return res.status(404).render('404');
        }

        return res.render('reset-password', { resetData });
    } catch (error) {
        return res.status(500).render('404');
    }
};


const updatePassword=async(req,res)=>{
    try {
        
        const {user_id,password,c_password}=req.body;
        const resetData=await PasswordReset.findOne({user_id})

        if(password != c_password){
                return res.render('reset-password',{resetData,error:"Confirm Passsword Not Matching"})
            }

            const hashPassword = await bcrypt.hash(c_password,10)
           await User.findByIdAndUpdate({_id:user_id},{$set:{password:hashPassword}})
          await PasswordReset.deleteMany({user_id})
          return res.redirect('/reset-success')

    } catch (error) {
        return res.status(500).render('404');

    }
}

const resetSuccess=async(req,res)=>{
    try {
        return res.render('reset-success')
    } catch (error) {
        return res.status(500).render('404');
    }
}


const generateAccessToken = async(user)=>{
   const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"2h"})
    return token;
}
const loginUser = async(req,res)=>{

    try {
        
       const errors = validationResult(req)
       if(!errors.isEmpty()){
            return res.status(400).json({
                success:false,
                msg:'Errors',
                errors: errors.array()
            })
       }

       const {email,password}=req.body;
       const userData = await User.findOne({email});
       if(!userData){
        return res.status(400).json({
            success:false,
            msg:'Email or Password is Incorrect'  
          })
       }

   const passwordMatch= await bcrypt.compare(password,userData.password);

   if(!passwordMatch){
    return res.status(400).json({
        success:false,
        msg:'Email or Password is Incorrect'  
      })
   }

   if(userData.is_verified == 0){
    return res.status(400).json({
        success:false,
        msg:'Please verify Account'  
      })
   }

 const accessToken = await generateAccessToken({user:userData})
 return res.status(200).json({
    success:true,
    msg:'Login Successfull',
    user:userData,
    accessToken:accessToken,
    tokenType:'Bearer'
 })

    } catch (error) {
        return res.status(400).json({
          success:false,
          msg:error.message  
        })
    }

}
module.exports = {
    userRegister,
    mailverification,
    sendMailVerification,
    forgotPassword,
    resetPassword,
    updatePassword,
    resetSuccess,
    loginUser
};
