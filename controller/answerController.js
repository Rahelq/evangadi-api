const dbConnection = require("../db/dbConfig");

async function postanswer(req, res) {
    const { questionid } = req.params;
   const { answer, userid } = req.body;
     
   try {
     // Generate a unique question ID
     
 
     // Check if the provided userId exists in the users table
     const [user] = await dbConnection.query(
       "SELECT userid FROM users WHERE userid = ?",
       [userid]
     );
    
     // If the user with the provided userId doesn't exist, return a 404 error
     if (user.length === 0) {
       return res.status(404).json({ msg: "User not found" });
     }
   
     // Insert the answer into the answers table
     await dbConnection.query(
       "INSERT INTO answers (answer, userid, questionid) VALUES (?, ?, ?)",
       [answer, userid, questionid]
     );
 
     return res.status(200).json({ msg: "Answer posted" });
   } catch (error) {
     console.error("Error posting answer:", error);
     return res
       .status(500)
       .json({ msg: "Something went wrong, try again later!" });
   }
 }
 
 async function getallanswer(req, res) {
   const {questionid}=req.params
   console.log(questionid)
   try {
 
 const allAnswersForQuestion = `
         SELECT username, answer FROM 
             answers JOIN users 
                 ON
             answers.userid = users.userid   
             WHERE answers.questionid = ?`;
 const [answers] = await dbConnection.query(allAnswersForQuestion, [questionid]);
 console.log(answers)
     return res.status(200).json(answers);
     
   } catch (error) {
     console.log(error.message);
     return res
       .status(500)
       .json({ msg: "Something went wrong, try again later!" });
   }
 }
 
 
 
 
 
 module.exports = { postanswer, getallanswer };
 