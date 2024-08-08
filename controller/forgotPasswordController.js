// // controller/forgotPasswordController.js
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const dbConnection = require('../db/dbConfig');
// const { StatusCodes } = require('http-status-codes');

// // Function to send a password reset email
// async function sendResetEmail(req, res) {
//     const { email } = req.body;
//     if (!email) {
//         return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Email is required' });
//     }

//     try {
//         // Check if the user exists
//         const [user] = await dbConnection.query('SELECT userid, email FROM users WHERE email = ?', [email]);
//         if (user.length === 0) {
//             return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'User with this email does not exist' });
//         }

//         // Create a reset token
//         const token = jwt.sign({ userid: user[0].userid }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         // Send email with the reset token
//         const transporter = nodemailer.createTransport({
//             service: 'Gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });

//         const resetUrl = `http://localhost:5500/reset/${token}`;

//         await transporter.sendMail({
//             to: email,
//             subject: 'Password Reset Request',
//             html: `<p>Click <a href="${resetUrl}">here</a> to reset your password</p>`,
//         });

//         res.status(StatusCodes.OK).json({ msg: 'Password reset email sent' });

//     } catch (error) {
//         console.log(error.message);
//         res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'Something went wrong, try again later' });
//     }
// }

// // Function to reset the password
// async function resetPassword(req, res) {
//     const { token } = req.params;
//     const { newPassword } = req.body;

//     if (!newPassword) {
//         return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'New password is required' });
//     }

//     try {
//         // Verify the token
//         const { userid } = jwt.verify(token, process.env.JWT_SECRET);

//         // Hash the new password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(newPassword, salt);

//         // Update the user's password
//         await dbConnection.query('UPDATE users SET password = ? WHERE userid = ?', [hashedPassword, userid]);

//         res.status(StatusCodes.OK).json({ msg: 'Password reset successful' });

//     } catch (error) {
//         console.log(error.message);
//         res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid or expired token' });
//     }
// }

// module.exports = { sendResetEmail, resetPassword };
