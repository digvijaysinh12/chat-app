import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,      // e.g. smtp.gmail.com
  port: 465,                       // TLS port
  secure: true,                   // false for TLS (port 587)
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Send an email
 * @param {string} to Recipient email address
 * @param {string} subject Email subject
 * @param {string} text Plain text email content
 * @param {string} [html] Optional HTML content
 */
export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"Real-Time Chat App 👋" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
    };

    if (html) {
      mailOptions.html = html;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default sendEmail;
