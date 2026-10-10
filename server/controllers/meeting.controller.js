const Meeting = require("../models/meetingModel");
const generateMeetingId = require("../utils/generateMeetingId");
const Participant = require("../models/participantModel");

const createMeeting = async (req, res) => {

    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }
        let meetingId;
        let existingMeeting;
        do {
            meetingId = generateMeetingId();
            existingMeeting = await Meeting.findOne({ meetingId });
        } while (existingMeeting);
        const meeting = await Meeting.create({
            meetingId,
            hostId: userId,
            title: "MeetSphere Meeting",
            status: "waiting",
        });
        return res.status(201).json({
            success: true,
            message: "Meeting created successfully.",
            meeting: {
                id: meeting._id,
                meetingId: meeting.meetingId,
                title: meeting.title,
                status: meeting.status,
                hostId: meeting.hostId,
                createdAt: meeting.createdAt,
            },
        });

    } catch (error) {
        console.error("CREATE MEETING ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create meeting.",
        });
    }
};

const joinMeeting = async (req, res) => {
    try {
        const { meetingId } = req.body;
        const userId = req.userId;

        if (!meetingId || !meetingId.trim()) {
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
                message: "Meeting not found. Please check the Meeting ID.",
            });
        }

        if (meeting.status === "ended") {
            return res.status(400).json({
                success: false,
                message: "This meeting has already ended.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Meeting found. Waiting for admission.",
            meeting: {
                id: meeting._id,
                meetingId: meeting.meetingId,
                title: meeting.title,
                status: meeting.status,
                hostId: meeting.hostId,
                createdAt: meeting.createdAt,
            },
        });

    } catch (error) {
        console.error("JOIN MEETING ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to join meeting.",
        });
    }
};

const getMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        if (!meetingId) {
            return res.status(400).json({
                success: false,
                message: "Meeting ID is required.",
            });
        }

        const meeting = await Meeting.findOne({
            meetingId: meetingId.trim(),
        }).populate(
            "hostId",
            "fullName email profileImage"
        );
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found.",
            });
        }
        if (meeting.status === "ended") {
            return res.status(400).json({
                success: false,
                message: "This meeting has ended.",
            });
        }
        return res.status(200).json({
            success: true,
            meeting: {
                id: meeting._id,
                meetingId: meeting.meetingId,
                title: meeting.title,
                status: meeting.status,
                host: meeting.hostId,
                startedAt: meeting.startedAt,
                endedAt: meeting.endedAt,
                createdAt: meeting.createdAt,
            },
        });

    } catch (error) {
        console.error("GET MEETING ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch meeting.",
        });
    }
};

const getMeetingParticipants = async (req, res) => {
    try {
        const { meetingId } = req.params;
        if (!meetingId) {
            return res.status(400).json({
                success: false,
                message: "Meeting ID is required.",
            });
        }
        const meeting = await Meeting.findOne({ meetingId: meetingId.trim(), });
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found.",
            });
        }
        const participants = await Participant.find({
            meetingId: meeting._id,
            leftAt: null,
        })
            .populate(
                "userId",
                "fullName email profileImage about"
            )
            .sort({ joinedAt: 1 });

        return res.status(200).json({
            success: true,
            participants,
        });
    } catch (error) {
        console.error(
            "GET PARTICIPANTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch participants.",
        });
    }
};

module.exports = { createMeeting, joinMeeting, getMeeting, getMeetingParticipants };