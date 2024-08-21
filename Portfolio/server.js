const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post('/send-email', (req, res) => {
    console.log('Request received:', req.body);
    const { name, email, message } = req.body;

    console.log(req.body);

    let transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587, // or 465 for SSL
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER, // The email address the user provided
        to: process.env.EMAIL_USER, // Your email address where you want to receive messages
        subject: `Contact Form Submission from ${name}`,
        text: message,
        html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error occurred while sending email:', error);
            return res.status(500).send('Error occurred while sending email');
        }
        console.log('Message sent: %s', info.messageId);
        res.send('Message sent successfully');
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
