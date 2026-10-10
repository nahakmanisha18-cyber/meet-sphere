const Meeting = require("../models/meetingModel");
const Participant = require("../models/participantModel");
const MeetingMessage = require("../models/meetingMessageModel");


const broadcastMeetingParticipants = async (io, meetingId) => {
    try {
        const meetingSockets = await io.in(meetingId).fetchSockets();

        const participants = meetingSockets
            .filter(
                (s) =>
                    s.meetingId === meetingId &&
                    s.isAdmitted === true &&
                    s.userId
            )
            .map((s) => ({
                socketId: s.id,
                userId: s.userId,
                fullName: s.fullName || "User",
                cameraOn: s.cameraOn ?? true,
                isHost: s.isHost === true,
                isHandRaised: s.isHandRaised === true,
            }));

        io.to(meetingId).emit(
            "meeting_participants_updated",
            participants
        );
    } catch (error) {
        console.error("PARTICIPANTS BROADCAST ERROR:", error);
    }
};


const setupSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        socket.on(
            "send_meeting_message",
            async (data) => {

                try {

                    const { meetingId, userId, text } = data;

                    if (!meetingId || !userId || !text?.trim()) {
                        console.log("CHAT DATA MISSING");
                        return;
                    }
                    const meeting = await Meeting.findOne({
                        meetingId: meetingId.trim(),
                    });
                    if (!meeting) {
                        console.log(" MEETING NOT FOUND:", meetingId);
                        return;
                    }
                    const isHost = meeting.hostId.toString() === userId.toString();

                    const participant = await Participant.findOne({
                        meetingId: meeting._id,
                        userId,
                        leftAt: null,
                    });


                    if (!isHost && !participant) {
                        console.log("USER NOT ADMITTED:", userId);
                        socket.emit(
                            "chat_error",
                            {
                                message: "You are not admitted to this meeting.",
                            }
                        );
                        return;
                    }
                    if (!socket.rooms.has(meetingId)) {
                        console.log("SOCKET NOT IN ROOM. JOINING NOW:", socket.id);
                        socket.join(meetingId);
                    }

                    const newMessage = await MeetingMessage.create({
                        meetingId: meeting._id,
                        senderId: userId,
                        text: text.trim(),
                    });

                    const populatedMessage = await MeetingMessage.findById(newMessage._id).populate("senderId", "fullName email profileImage");
                    const messageData = {
                        _id: populatedMessage._id,
                        meetingId: meetingId,
                        senderId: populatedMessage.senderId,
                        text: populatedMessage.text,
                        createdAt: populatedMessage.createdAt,
                    };
                    io.in(meetingId).emit(
                        "new_meeting_message",
                        messageData
                    );

                } catch (error) {
                    console.error("SEND MEETING MESSAGE ERROR:", error);
                }
            }
        );
        socket.on("join_meeting", async (data) => {
            try {
                const { meetingId, userId, fullName, cameraOn = true } = data;
                if (!meetingId || !userId) return;
                const meeting = await Meeting.findOne({
                    meetingId
                });
                if (!meeting) {
                    socket.emit("join_denied", {
                        reason: "Meeting not found."
                    });
                    return;
                }
                const isActualHost = meeting.hostId.toString() === userId.toString();
                if (!isActualHost) {
                    socket.emit("join_denied", {
                        reason: "Only the meeting host can directly join."
                    });
                    return;
                }

                socket.join(meetingId);

                socket.meetingId = meetingId;
                socket.userId = userId;
                socket.fullName = fullName || "User";
                socket.cameraOn = cameraOn;

                socket.isHost = true;
                socket.isAdmitted = true;
                socket.pendingMeetingId = null;

                const existingSockets = await io.in(meetingId).fetchSockets();

                

                existingSockets.forEach((existingSocket) => {
                    if (existingSocket.id === socket.id) return;
                    socket.emit("existing_participant", {
                        socketId: existingSocket.id,
                        userId: existingSocket.userId,
                        fullName: existingSocket.fullName || "User",
                        cameraOn: existingSocket.cameraOn ?? true
                    });
                });

                await broadcastMeetingParticipants(io, socket.meetingId);

                socket.to(meetingId).emit(
                    "participant_joined",
                    {
                        socketId: socket.id,
                        userId,
                        fullName: socket.fullName,
                        cameraOn: socket.cameraOn
                    }
                );

                socket.emit("meeting_joined", { meetingId });

            } catch (error) {
                console.error("Host join meeting error:", error);
                socket.emit("join_denied", {
                    reason: "Unable to join meeting."
                });
            }
        });

        socket.on("rejoin_meeting", async (data) => {
            try {
                const { meetingId, userId, fullName, cameraOn = true, } = data;
                if (!meetingId || !userId) return;
                const meeting = await Meeting.findOne({
                    meetingId,
                });
                if (!meeting) {
                    socket.emit("join_denied", {
                        reason: "Meeting not found.",
                    });
                    return;
                }
                const participant = await Participant.create({
                    meetingId: meeting._id,
                    userId: targetSocket.userId,
                    joinedAt: new Date(),
                    leftAt: null,
                });

                targetSocket.join(socket.meetingId);
                targetSocket.isAdmitted = true;
                targetSocket.emit("participant_admitted", {
                    meetingId: socket.meetingId,
                });
                if (!participant) {
                    socket.emit("join_denied", {
                        reason:
                            "You are not admitted to this meeting.",
                    });
                    return;
                }
                socket.join(meetingId);
                socket.meetingId = meetingId;
                socket.userId = userId;
                socket.fullName = fullName || "User";
                socket.cameraOn = cameraOn;

                socket.isHost = false;
                socket.isAdmitted = true;
                socket.pendingMeetingId = null;
                // console.log("🔄 PARTICIPANT REJOINED:", {
                //     socketId: socket.id,
                //     userId,
                //     fullName,
                //     meetingId,
                // });

                const existingSockets = await io.in(meetingId).fetchSockets();
                existingSockets.forEach((existingSocket) => {
                    if (existingSocket.id === socket.id) {
                        return;
                    }
                    socket.emit("existing_participant", {
                        socketId: existingSocket.id,
                        userId: existingSocket.userId,
                        fullName: existingSocket.fullName || "User",
                        cameraOn: existingSocket.cameraOn ?? true,
                    });
                });
                socket.to(meetingId).emit(
                    "participant_joined",
                    {
                        socketId: socket.id,
                        userId,
                        fullName: socket.fullName,
                        cameraOn: socket.cameraOn,
                    }
                );

                socket.emit("meeting_joined", {
                    meetingId,
                });

            } catch (error) {
                console.error(
                    "REJOIN MEETING ERROR:",
                    error
                );

                socket.emit("join_denied", {
                    reason: "Unable to rejoin meeting.",
                });
            }
        });
        socket.on("request_join_meeting", async (data) => {
            try {

                const { meetingId, userId, fullName, cameraOn = true } = data;

                if (!meetingId || !userId) {
                    return;
                }
                const meeting = await Meeting.findOne({ meetingId });

                if (!meeting) {
                    socket.emit("join_denied", {
                        reason: "Meeting not found.",
                    });

                    return;
                }
                const existingParticipant = await Participant.findOne({
                    meetingId: meeting._id,
                    userId: userId,
                });

                socket.userId = userId;
                socket.fullName = fullName || "User";
                socket.cameraOn = cameraOn;
                socket.pendingMeetingId = null;
                socket.isHost = false;
                if (existingParticipant) {
                    console.log(" USER ALREADY ADMITTED → DIRECT JOIN");
                    existingParticipant.leftAt = null;
                    existingParticipant.joinedAt = new Date();
                    existingParticipant.isCameraOn = cameraOn;
                    existingParticipant.isMuted = false;
                    await existingParticipant.save();
                    socket.join(meetingId);
                    socket.meetingId = meetingId;
                    socket.isAdmitted = true;

                    const existingSockets = await io.in(meetingId).fetchSockets();
                    socket.emit(
                        "participant_admitted",
                        {
                            meetingId,
                            autoJoined: true,
                        }
                    );
                    existingSockets.forEach(
                        (existingSocket) => {

                            if (existingSocket.id === socket.id) {
                                return;
                            }

                            socket.emit(
                                "existing_participant",
                                {
                                    socketId: existingSocket.id,
                                    userId: existingSocket.userId,
                                    fullName: existingSocket.fullName || "User",
                                    cameraOn: existingSocket.cameraOn ?? true,
                                }
                            );
                        }
                    );
                    socket
                        .to(meetingId)
                        .emit(
                            "participant_joined",
                            {
                                socketId: socket.id,
                                userId: socket.userId,
                                fullName: socket.fullName,
                                cameraOn: socket.cameraOn,
                            }
                        );
                    await broadcastMeetingParticipants(io, meetingId);
                    return;
                }

                socket.pendingMeetingId = meetingId;
                socket.isAdmitted = false;
                const meetingSockets = await io.in(meetingId).fetchSockets();

                const hostSocket = meetingSockets.find((s) =>
                    s.isHost === true && s.userId?.toString() === meeting.hostId.toString()
                );


                if (!hostSocket) {
                    socket.emit("join_denied", {
                        reason: "The host is not currently in the meeting.",
                    });
                    socket.pendingMeetingId = null;
                    return;
                }

                hostSocket.emit(
                    "join_request",
                    {
                        socketId: socket.id,
                        userId: socket.userId,
                        fullName: socket.fullName,
                        cameraOn: socket.cameraOn,
                    }
                );


            } catch (error) {
                console.error(" REQUEST JOIN ERROR:", error);
                socket.emit("join_denied", {
                    reason: "Unable to request joining meeting.",
                });
            }
        });

        socket.on("admit_participant", async ({ socketId }) => {
            try {

                if (!socket.isHost) {
                    console.log("Unauthorized admit attempt:", socket.id);
                    return;
                }

                if (!socket.meetingId || !socketId) {
                    return;
                }

                const targetSocket = io.sockets.sockets.get(socketId);

                if (!targetSocket) {
                    console.log("Waiting user socket not found:", socketId);
                    return;
                }

                if (targetSocket.pendingMeetingId !== socket.meetingId) {
                    console.log("Invalid meeting request.");
                    return;
                }

                const meeting = await Meeting.findOne({
                    meetingId: socket.meetingId,
                });

                if (!meeting) {
                    return;
                }

                let participant = await Participant.findOne({
                    meetingId: meeting._id,
                    userId: targetSocket.userId,
                });

                if (participant) {

                    participant.leftAt = null;
                    participant.joinedAt = new Date();
                    participant.isMuted = false;
                    if (targetSocket.cameraOn !== undefined) {
                        participant.isCameraOn =
                            targetSocket.cameraOn;
                    }
                    await participant.save();
                } else {

                    participant = await Participant.create({
                        meetingId: meeting._id,
                        userId: targetSocket.userId,
                        joinedAt: new Date(),
                        leftAt: null,
                        isMuted: false,
                        isCameraOn: targetSocket.cameraOn ?? true,
                        isScreenSharing: false,
                        isHandRaised: false,
                    });
                }

                const existingSockets = await io.in(socket.meetingId).fetchSockets();
                targetSocket.join(socket.meetingId);
                targetSocket.meetingId = socket.meetingId;
                targetSocket.pendingMeetingId = null;
                targetSocket.isAdmitted = true;
                targetSocket.isHost = false;
                targetSocket.emit(
                    "participant_admitted",
                    {
                        meetingId:
                            socket.meetingId,
                    }
                );

                existingSockets.forEach(
                    (existingSocket) => {

                        if (existingSocket.id === targetSocket.id) {
                            return;
                        }

                        targetSocket.emit(
                            "existing_participant",
                            {
                                socketId: existingSocket.id,
                                userId: existingSocket.userId,
                                fullName: existingSocket.fullName || "User",
                                cameraOn: existingSocket.cameraOn ?? true,
                            }
                        );
                    }
                );

                existingSockets.forEach(
                    (existingSocket) => {
                        existingSocket.emit(
                            "participant_joined",
                            {
                                socketId: targetSocket.id,
                                userId: targetSocket.userId,
                                fullName: targetSocket.fullName || "User",
                                cameraOn: targetSocket.cameraOn ?? true,
                            }
                        );
                    }
                );
            } catch (error) {

                console.error(
                    " ADMIT PARTICIPANT ERROR:",
                    error
                );
            }
        });
        socket.on(
            "deny_participant",
            ({ socketId }) => {
                if (!socket.isHost) {
                    return;
                }

                if (!socketId) {
                    return;
                }
                const targetSocket = io.sockets.sockets.get(socketId);

                if (!targetSocket) {
                    return;
                }
                if (
                    targetSocket.pendingMeetingId !== socket.meetingId
                ) {
                    return;
                }

                targetSocket.emit(
                    "join_denied",
                    {
                        reason: "The host denied your request to join.",
                    }
                );

                targetSocket.pendingMeetingId = null;

                console.log(
                    `${targetSocket.fullName} was denied by ${socket.fullName}`
                );
            }
        );

        socket.on( "camera_state_changed", (data) => {

                const { meetingId, userId, cameraOn, } = data;
                if (!meetingId) return;
                socket.cameraOn = cameraOn;
                socket
                    .to(meetingId)
                    .emit(
                        "camera_state_changed",
                        { socketId: socket.id, userId, cameraOn }
                    );
                console.log(
                    `${socket.fullName} camera: ${cameraOn ? "ON" : "OFF"
                    }`
                );
            }
        );

        socket.on( "offer", ({ to, offer }) => {

                if (!to || !offer) {
                    return;
                }
                io.to(to).emit(
                    "offer",
                    { from: socket.id, offer, }
                );
            }
        );

        socket.on("answer", ({ to, answer }) => {

                if (!to || !answer) {
                    return;
                }
                io.to(to).emit(
                    "answer",
                    { from: socket.id, answer }
                );
            }
        );
        socket.on("ice-candidate",({ to, candidate }) => {

                if (!to || !candidate) {
                    return;
                }

                io.to(to).emit(
                    "ice-candidate",
                    { from: socket.id, candidate }
                );
            }
        );

        socket.on("leave_meeting", () => {
                handleParticipantLeave(socket, io);
            }
        );

        socket.on( "disconnect",() => {
                console.log("User disconnected:", socket.id);
                handleParticipantLeave(socket, io);
            }
        );

        socket.on("hand_raise", async ({ isHandRaised }) => {
            try {
                if (!socket.meetingId || !socket.isAdmitted) {
                    return;
                }

                socket.isHandRaised = Boolean(isHandRaised);

                io.to(socket.meetingId).emit("hand_raise_updated", {
                    socketId: socket.id,
                    userId: socket.userId,
                    fullName: socket.fullName || "User",
                    isHandRaised: socket.isHandRaised,
                });

                await broadcastMeetingParticipants(io, socket.meetingId);
            } catch (error) {
                console.error("HAND RAISE ERROR:", error);
            }
        });

    });
};


const handleParticipantLeave = async (socket, io) => {
    const { meetingId, userId, fullName } = socket;

    if (!meetingId) {
        socket.pendingMeetingId = null;
        return;
    }

    try {
        const meeting = await Meeting.findOne({ meetingId });

        if (meeting && userId) {
            await Participant.findOneAndUpdate(
                {
                    meetingId: meeting._id,
                    userId,
                    leftAt: null,
                },
                {
                    leftAt: new Date(),
                }
            );
        }
    } catch (error) {
        console.error("Participant leave DB update error:", error);
    }

    socket.to(meetingId).emit("participant_left", {
        socketId: socket.id,
        userId,
        fullName: fullName || "User",
    });

    console.log(`${fullName || "User"} left meeting ${meetingId}`);

    socket.leave(meetingId);

    await broadcastMeetingParticipants(io, meetingId);

    socket.meetingId = null;
    socket.isAdmitted = false;
    socket.pendingMeetingId = null;
};


module.exports = setupSocket;