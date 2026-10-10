const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
    {
        meetingId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            default: "MeetSphere Meeting",
            trim: true,
        },

        status: {
            type: String,
            enum: ["waiting", "active", "ended"],
            default: "waiting",
        },

        startedAt: {
            type: Date,
            default: null,
        },

        endedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Meeting", meetingSchema);