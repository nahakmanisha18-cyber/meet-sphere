const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
    {
        meetingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meeting",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        joinedAt: {
            type: Date,
            default: Date.now,
        },

        leftAt: {
            type: Date,
            default: null,
        },

        isMuted: {
            type: Boolean,
            default: false,
        },

        isCameraOn: {
            type: Boolean,
            default: true,
        },

        isScreenSharing: {
            type: Boolean,
            default: false,
        },

        isHandRaised: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

participantSchema.index(
    { meetingId: 1, userId: 1 },
    { unique: true }
);

module.exports = mongoose.model("Participant", participantSchema);