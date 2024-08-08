const dbConnection = require("../db/dbConfig")
const bcrypt = require('bcrypt')
const {StatusCodes} = require('http-status-codes')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
 auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function register(req,res){
    const {username, firstname, lastname,email, password} = req.body;
    if(!email || !password || !firstname || !lastname || !username){
        return res.status(StatusCodes.BAD_REQUEST).json({msg: "please provide all required information"})
    }
    try {
        const [user] = await dbConnection.query("select username, userid from users where username = ? or email = ?", [username, email])
        //   return res.json({user: user});
        if(user.length > 0){
          return  res.status(400).json({msg: "user already registered"})
        }
        if(password.length < 8){
            return res.status(400).json({msg:"password must be at least 8 characters"})
        }

        //encrypt the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        await dbConnection.query("INSERT INTO users(username, firstname, lastname, email, password) VALUES (?,?,?,?,?)", [username, firstname, lastname, email, hashedPassword])
        return res.status(201).json({msg: "user registered"})
    } catch (error) {
        console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json({msg: "something went wrong, try again later!"})

    }
}
async function login(req,res){
   const {email, password} = req.body;
   if(!email || !password){
    return res.status(StatusCodes.BAD_REQUEST).json({msg: "please enter all the required fields"});
}

   try {
    const [user] = await dbConnection.query("select username, userid, password from  users where email = ?", [email])
     //res.json({user: user})
       if(user.length == 0){
        return res.status(StatusCodes.BAD_REQUEST).json({msg: "invalid credential"});
       }
       //compare password
    const isMatch = await bcrypt.compare(password, user[0].password)
     if(!isMatch){
        return res.status(StatusCodes.BAD_REQUEST).json({msg: "invalid credential"})
     }
        // if it matches
        //return res.json({user: user[0].password})

       // if it matches use json token (jwt)
           const username = user[0].username;
           const userid = user[0].userid;
           const token = jwt.sign({username, userid}, process.env.JWT_SECRET, {expiresIn : "1d"})

           return res.status(StatusCodes.OK).json({msg: "user login successful", token, username})

} catch (error) {
    console.log(error.message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: "something went wrong, try again later!"})

   }
}

async function checkUser(req,res){
    const username = req.user.username
    const userid= req.user.userid
    res.status(StatusCodes.OK).json({msg: "valid user", username, userid})
}

async function getuser(req, res) {
    try{
  const [user] = await dbConnection.query(
    "SELECT * FROM users");
    return res.status(200).json(user);
  }catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ msg: "Something went wrong, try again later!" });
  }
  }



  async function forgotPassword(req, res) {
    const { email } = req.body;
    const resetTokens = {};
    console.log("req.body:", req.body);
    console.log("email:", email);
  
    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Please provide your email" });
    }
    try {
      const [user] = await dbConnection.query(
        "SELECT username FROM users where email = ?",
        email
      );
      
  
      if (user.length == 0) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: "user is not registered" });
      }
  
      const resetToken = crypto.randomBytes(20).toString("hex");
      const rtExpiryDate = Date.now() + 600000;
  
      console.log("resetToken", resetToken);
      console.log("rtExpiryDate", rtExpiryDate);
  
      // await dbConnection.query("UPDATE users SET resetToken = ? where email = ?", [
      //   resetToken,
      //   email,
      // ]);
  
      await dbConnection.query("UPDATE users SET resetToken = ?, rtExpiryDate = ? WHERE email = ?", [
        resetToken,
        rtExpiryDate,
        email,
      ]);

      // Define email content
      const mailOptions = {
        from: "api@demomailtrap.com",
        to: email,
        subject: "Password Reset request",
        text:
          `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
          `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
          `http://localhost:5173/reset/${resetToken}\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
      // Send email
      transporter.sendMail(mailOptions, (err, info) => {
        console.log("Email sent successfully!");
        return res.status(StatusCodes.OK).json(info);
      });
    } catch (err) {
      console.log(err.message);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Something went wrong. please try later" });
    }
  }
  
  async function resetPassword(req, res) {
    const { resetToken, newPassword } = req.body;
    console.log("req.body:", req.body);
    console.log(newPassword);
  
    //check new password satisifies length criteria
    if (newPassword.length <= 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "password must be at least 8 charcters" });
    }
  
    try {
      //Check user exists using the resetToken
      const [ruser] = await dbConnection.query(
        "SELECT username FROM users where resetToken = ?",
        resetToken
      );
  
      console.log("ruser:", ruser);
  
      if (ruser.length == 0) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: "user is not registered" });
      }
  
      const rusername = ruser[0].username;
      console.log("rusername:", rusername);
  
      // encrypt the password
      const salt = await bcrypt.genSalt();
      const hashednewPassword = await bcrypt.hash(newPassword, salt);
  
      //updade the password to new. Reset the token to Null
      await dbConnection.query(
        "UPDATE users SET password = ?, resetToken = ? where username = ?",
        [hashednewPassword, null, rusername]
      );
  
      return res
        .status(StatusCodes.CREATED)
        .json({ msg: "password reset successfully" });
    } catch (err) {
      console.log(err.message);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Something went wrong. please try later" });
    }
  }


module.exports ={register, login, checkUser,getuser, forgotPassword, resetPassword,}