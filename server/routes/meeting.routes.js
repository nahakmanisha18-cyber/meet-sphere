const express = require("express");
const router = express.Router();
const { createMeeting, joinMeeting, getMeeting, getMeetingParticipants } = require("../controllers/meeting.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/create", authMiddleware, createMeeting);
router.post("/join", authMiddleware, joinMeeting);
router.get("/:meetingId", authMiddleware, getMeeting);
router.get("/:meetingId/participants", authMiddleware, getMeetingParticipants);
module.exports = router;