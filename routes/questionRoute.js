const express = require('express');
const router = express.Router();

//authentication middleware
const authMiddleware = require("../middleware/authMiddleware")

const { postquestion, getallquestions} = require("../controller/questionController");

router.post("/postquestion", postquestion )
router.get("/getallquestions", getallquestions);
//see single question or post single question
module.exports = router