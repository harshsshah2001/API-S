const nodemailer=require('nodemailer')

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  
  // async..await is not allowed in global scope, must use a wrapper
  // async function main() {
  //   // send mail with defined transport object
  //   const info = await transporter.sendMail({
  //     from: '<minimilitia1491@gmail.com>', // sender address
  //     to: "hs6648279@gmail.com", // list of receivers
  //     subject: "Hello ✔", // Subject line
  //     text: "Hello world?", // plain text body
  //     html: '<p>Hii, '+userRegister.name+', Verify<a href="http://localhost:3000/mail-verification?id='+userData._id+'">Apologize</a><p/>', // html body
  //   });
  
  //   console.log("Message sent: %s", info.messageId);
  //   // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  // }
  // main().catch(console.error);

  const sendMail = async (subject, content) => {
    try {
      const mailOptions = {
        from: '<minimilitia1491@gmail.com>', // sender address
        to: '<hs6648279@gmail.com>', // list of receivers
        subject: subject, // Subject line
        html: content // html body
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Mail Sent:', info.messageId);
    } catch (error) {
      console.error('Error occurred while sending email:', error);
    }main().catch(console.error);
  };
  
  module.exports = {
    sendMail
  };