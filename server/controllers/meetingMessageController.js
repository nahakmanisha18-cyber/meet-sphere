const Meeting = require("../models/meetingModel");
const MeetingMessage = require("../models/meetingMessageModel");
const Participant = require("../models/participantModel");

const getMeetingMessages = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const userId = req.userId;
        if (!meetingId) {
            return res.status(400).json({
                success: false,
                message: "Meeting ID is required.",
            });
        }

        const meeting = await Meeting.findOne({
            meetingId: meetingId.trim(),
        });
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found.",
            });
        }

        const isHost = meeting.hostId.toString() === userId.toString();
        const participant = await Participant.findOne({ meetingId: meeting._id, userId, leftAt: null });

        if (!isHost && !participant) {
            return res.status(403).json({
                success: false,
                message:  "You are not admitted to this meeting.",
            });
        }

        const messages = await MeetingMessage.find({ meetingId: meeting._id,})
                .populate(
                    "senderId",
                    "fullName email profileImage"
                )
                .sort({
                    createdAt: 1,
                });
        return res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        console.error( "GET MEETING MESSAGES ERROR:",  error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch messages.",
        });
    }
};

module.exports = {getMeetingMessages};