require("dotenv").config();
const express = require("express");
const app = express();
const port = 5600;
const cors = require("cors");
// app.get('/', (req, res)=>{
//     res.send("welcome")
// })
app.use(cors());
//db connection
const dbConnection = require("./db/dbConfig");

//user routes middleware file
const userRoutes = require("./routes/userRoute");

//question routes middleware file
const questionRoutes = require("./routes/questionRoute");

//answer routes middleware
const answerRoutes = require("./routes/answerRoute");

//forgot password routes middleware file
// const forgotPasswordRoutes = require('./routes/forgotPasswordRoute');

//authentication middleware
const authMiddleware = require("./middleware/authMiddleware");

//builtin middleware json middleware to extract json data
app.use(express.json());

// user routes middleware
app.use("/api/users", userRoutes);

// question routes middleware
// app.use("/api/questions", authMiddleware, questionRoutes);
app.use("/api/questions", questionRoutes);
// answers routes middleware
app.use("/api/answers", answerRoutes);

async function start() {
	try {
		const result = await dbConnection.execute("SELECT 'test'");
		await app.listen(port);
		console.log("database connection established");
		console.log(`listening on port ${port}`);
	} catch (error) {
		console.log(error.message);
	}
}

start();
// app.listen(port, (err)=>{
//     if(err){
//         console.log(err.message);

//     }else{
//         console.log(`listening on port ${port}`)
//     }
// })
