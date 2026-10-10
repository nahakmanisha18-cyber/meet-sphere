const express = require("express");
const router = express.Router();
const {getMeetingMessages} = require("../controllers/meetingMessageController");


router.get("/:meetingId",getMeetingMessages);
module.exports = router;