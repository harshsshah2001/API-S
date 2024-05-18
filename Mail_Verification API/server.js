require('dotenv').config();
const express = require('express');
const app = express();
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const port = process.env.SERVER_PORT || 3000; // Replaced | with ||
const sendmail=require('./helpers/mailer')
const mongoose = require('mongoose');
app.set('view engine','ejs')
app.set('views','./views')
mongoose.connect('mongodb://127.0.0.1:27017/restful')
    .then(() => {
        console.log("Database is Connected");
    })
    .catch((err) => { // Changed to catch for error handling
        console.error("Database connection error:", err);
    });

app.use('/api', userRoute);
app.use('/', authRoute);

app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
