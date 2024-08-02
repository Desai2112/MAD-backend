import nodemailer from 'nodemailer';

async function sendEmail(recipient:string, subject:string, message:string) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.Sender_Email,
            pass: process.env.Sender_Pass
        }
    });

    let mailOptions = {
        from: `"Om Desai" ${process.env.Sender_Email}`,
        to: recipient,
        subject: subject,
        text: message,
        html: `<b>${message}</b>`
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return 'Email sent successfully!';
    } catch (error) {
        console.error('Error sending email: ', error);
        return 'Failed to send email.';
    }
}

export { sendEmail };
