

const dbConnection = require("../db/dbConfig");
const { v4 : uuidv4 } = require ("uuid")

async function getallquestions(req, res) {
  try {
    // Retrieve all questions from the database
    const [questions] = await dbConnection.query("SELECT * FROM questions");

    return res.status(200).json(questions);
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ msg: "Something went wrong, try again later!" });
  }
}

async function postquestion(req, res) {
  res.status(405).json({ msg: "Method Not Allowed" });
}

async function postquestion(req, res) {
   const { title, description, userid  } = req.body;

  // const { title, description } = req.body;
  //   const { userid } = req.user;

try {
  const questionid = uuidv4();
  // Check if the provided userid exists in the users table
  // const [user] = await dbConnection.query(
  //   "SELECT userid FROM users WHERE userid = ?",
  //   [userid]
  // );

  // if (user.length === 0) {
  //   // If the user with the provided userid doesn't exist, return an error
  //   return res.status(404).json({ msg: "User not found" });
  // }

  // Check if a question with the provided questionid exists in the question table
  // const [existingQuestion] = await dbConnection.query(
  //   "SELECT questionid FROM questions WHERE questionid = ?",
  //   [questionid]
  // );

  // if (existingQuestion.length > 0) {
  //   // If a question with the provided questionid already exists, return an error
  //   return res.status(400).json({ msg: "Question already exists" });
  // }

  // If the user exists and the question doesn't exist, proceed to insert the question
  await dbConnection.query(
    "INSERT INTO questions (title, description, userid, questionid) VALUES (?, ?, ?, ?)",
    [title, description, userid, questionid]
  );

  return res.status(200).json({ msg: "Question posted" });
} catch (error) {
  console.log(error.message);
  return res
    .status(500)
    .json({ msg: "Something went wrong, try again later!" });
}


}

module.exports = { postquestion, getallquestions };
