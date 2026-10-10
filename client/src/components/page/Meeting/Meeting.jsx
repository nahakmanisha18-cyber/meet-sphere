
import api from "../../../api/axios";
import React, { useState, useEffect, useRef } from "react";
import socket from "../../../socket/socket";
import {
    FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaDesktop, FaHandPaper, FaComments, FaUsers, FaEllipsisV, FaCopy, FaTimes, FaPaperPlane, FaFile, FaCircle, FaShieldAlt, FaUserPlus, FaSearch, FaInfoCircle, FaUser
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import "./Meeting.css";
import { useDispatch, useSelector } from "react-redux";
import { getMeetingMessages } from "../../../redux/action/messageAction";
import { addMessage } from "../../../redux/slice/messageSlice";
import { getMeeting, getMeetingParticipants } from "../../../redux/action/meetingAction";
import ChatPanel from "../../ChatPanel";
import PeoplePanel from "../../PeoplePanel";

const Meeting = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const [activePanel, setActivePanel] = useState(null);
    const [participantChecked, setParticipantChecked] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const [liveParticipants, setLiveParticipants] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const localVideoRef = useRef(null);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    const peerConnectionsRef = useRef({});
    const remoteVideoRefs = useRef({});
    const [messageText, setMessageText] =
        useState("");

    const [sendingMessage, setSendingMessage] =
        useState(false);

    const chatMessagesRef = useRef(null);
    const isAdmin =
        user.role === "admin" ||
        user.role === "Admin" ||
        user.isAdmin === true;

    const [waitingUsers, setWaitingUsers] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);
    const [isAdmitted, setIsAdmitted] = useState(false);
    const [joinDenied, setJoinDenied] = useState(false);
    const localStreamRef = useRef(null);
    const remoteNamesRef = useRef({});
    const [remoteCameraStates, setRemoteCameraStates] = useState({});
    const [cameraOn, setCameraOn] = useState(() => {
        const savedCameraState = localStorage.getItem("meetSphere_cameraOn");
        return savedCameraState === null ? true : savedCameraState === "true";
    });

    const cameraStateRef = useRef(cameraOn);

    useEffect(() => {
        cameraStateRef.current = cameraOn;
    }, [cameraOn]);


    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    const rtcConfig = {
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302",
            },
        ],
    };

    const [micOn, setMicOn] = useState(() => {
        const savedMicState = localStorage.getItem("meetSphere_micOn");
        return savedMicState === null
            ? true
            : savedMicState === "true";
    });

    const dispatch = useDispatch();

    const {
        meetingDetails,
        participants,
        loading,
        error,
    } = useSelector((state) => state.meeting);

    const meeting = meetingDetails;
    const isHost = meeting?.host?._id?.toString() === user?.id?.toString() || meeting?.hostId?.toString() === user?.id?.toString();
    const meetingId = meeting?.meetingId || roomId;

    const {
        messages,
        loading: messageLoading,
        error: messageError,
    } = useSelector(
        (state) => state.message
    );

    useEffect(() => {

        if (!roomId) {
            console.log(" roomId missing");
            return;
        }

        if (!isHost && !isAdmitted) {
            console.log("User is not admitted yet");
            return;
        }

        dispatch(getMeetingMessages(roomId))
            .unwrap()
            .then((data) => {
                console.log("MESSAGES API RESPONSE:", data);
            })
            .catch((err) => {
                console.error("MESSAGES API ERROR:", err);
            });
    }, [roomId, isHost, isAdmitted, dispatch]);

    useEffect(() => {
        if (!roomId) {
            return;
        }
        dispatch(getMeeting(roomId));

    }, [roomId, dispatch]);

    useEffect(() => {

        if (!roomId) {
            return;
        }
        dispatch(getMeetingParticipants(roomId));

    }, [roomId, dispatch]);


    const handleCopyMeetingId = () => {
        navigator.clipboard.writeText(meetingId);
    };

    const handleAdmitRequest = (person) => {
        socket.emit("admit_participant", { socketId: person.socketId });
        setWaitingUsers((prev) =>
            prev.filter((item) => item.socketId !== person.socketId)
        );
        setJoinRequests((prev) =>
            prev.filter((item) => item.socketId !== person.socketId)
        );
    };

    const handleDenyRequest = (person) => {
        socket.emit("deny_participant", {
            socketId: person.socketId,
        });

        setWaitingUsers((prev) =>
            prev.filter(
                (item) => item.socketId !== person.socketId
            )
        );

        setJoinRequests((prev) =>
            prev.filter(
                (item) => item.socketId !== person.socketId
            )
        );
    };

    const handleLeaveMeeting = () => {
        socket.emit("leave_meeting");
        socket.disconnect();
        navigate("/");
    };
    const handleCameraToggle = async () => {
        try {
            if (!localStream) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                setLocalStream(stream);
                const videoTrack = stream.getVideoTracks()[0];

                if (videoTrack) {
                    videoTrack.enabled = true;
                    setCameraOn(true);
                }
                return;
            }

            const videoTrack = localStream.getVideoTracks()[0];

            if (!videoTrack) {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                });

                const newVideoTrack = newStream.getVideoTracks()[0];

                if (!newVideoTrack) {
                    return;
                }
                localStream.addTrack(newVideoTrack);
                setCameraOn(true);
                cameraStateRef.current = true;
                localStorage.setItem(
                    "meetSphere_cameraOn",
                    "true"
                );
                socket.emit("camera_state_changed", {
                    meetingId: roomId,
                    userId: user.id,
                    cameraOn: true,
                });
                return;
            }
            const newCameraState = !cameraOn;
            videoTrack.enabled = newCameraState;
            setCameraOn(newCameraState);
            localStorage.setItem(
                "meetSphere_cameraOn",
                String(newCameraState)
            );

            socket.emit("camera_state_changed", {
                meetingId: roomId,
                userId: user.id,
                cameraOn: newCameraState,
            });

        } catch (error) {
            console.error("Camera toggle error:", error);
        }
    };

    const handleMicToggle = () => {
        const stream = localStreamRef.current;
        if (!stream) {
            console.warn("Microphone stream not available");
            return;
        }
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
            console.warn("Audio track not found");
            return;
        }
        const currentlyEnabled = audioTracks.some(
            (track) => track.enabled
        );
        const newMicState = !currentlyEnabled;
        audioTracks.forEach((track) => {
            track.enabled = newMicState;
        });

        setMicOn(newMicState);
        localStorage.setItem("meetSphere_micOn", String(newMicState));
        if (!newMicState) {
            setIsSpeaking(false);
        }
        console.log(
            newMicState ? "Microphone ON" : "Microphone OFF",
            audioTracks.map((track) => ({
                enabled: track.enabled,
                muted: track.muted,
                readyState: track.readyState,
            }))
        );
    };
    const togglePanel = (panel) => {
        setActivePanel((prev) => {
            console.log("PREVIOUS PANEL:", prev);
            console.log("NEW PANEL:", prev === panel ? null : panel);

            return prev === panel ? null : panel;
        });
    };

    const toggleHandRaise = () => {
        const nextState = !isHandRaised;
        setIsHandRaised(nextState);
        socket.emit("hand_raise", {
            isHandRaised: nextState,
        });
    };


    useEffect(() => {

        const handleExistingParticipant = (data) => {
            const { socketId, userId, fullName, cameraOn } = data;
            remoteNamesRef.current[
                socketId
            ] = fullName || "Participant";
            setRemoteCameraStates((prev) => ({
                ...prev,
                [socketId]:
                    cameraOn ?? true,
            }));
            createPeerConnection(
                socketId
            );
        };
        socket.on("existing_participant", handleExistingParticipant);
        return () => {
            socket.off("existing_participant", handleExistingParticipant);
        };

    }, []);


    useEffect(() => {
        if (!roomId || !user?.id || !meeting || !participantChecked) {
            return;
        }

        const handleJoinRequest = (data) => {
            const request = {
                socketId: data.socketId,
                userId: data.userId,
                fullName: data.fullName || "User",
                cameraOn: data.cameraOn ?? true,
            };

            setWaitingUsers((prev) => {
                if (prev.some((item) => item.socketId === request.socketId)) {
                    return prev;
                }
                return [...prev, request];
            });

            setJoinRequests((prev) => {
                if (prev.some((item) => item.socketId === request.socketId)
                ) {
                    return prev;
                }
                return [...prev, request];
            });
        };

        const handleParticipantAdmitted = (data) => {
            setIsAdmitted(true);
            setJoinDenied(false);
        };

        const handleJoinDenied = (data) => {
            setIsAdmitted(false);
            setJoinDenied(true);
        };

        socket.on("join_request", handleJoinRequest);
        socket.on("participant_admitted", handleParticipantAdmitted);
        socket.on("join_denied", handleJoinDenied);

        if (!socket.connected) {
            socket.connect();
        }

        const startMeeting = () => {
            if (isHost) {
                setIsAdmitted(true);
                socket.emit("join_meeting", {
                    meetingId: roomId,
                    userId: user.id,
                    fullName: user.fullName || "User",
                    cameraOn: cameraStateRef.current,
                });
                return;
            }
            socket.emit("request_join_meeting", {
                meetingId: roomId,
                userId: user.id,
                fullName: user.fullName || "User",
                cameraOn: cameraStateRef.current,
            });
        };

        if (socket.connected) {
            startMeeting();
        } else {
            socket.once("connect", startMeeting);
        }
        return () => {
            socket.off("join_request", handleJoinRequest);
            socket.off("participant_admitted", handleParticipantAdmitted);
            socket.off("join_denied", handleJoinDenied);
            socket.off("connect", startMeeting);
        };

    }, [roomId, user?.id, meeting, isHost, participantChecked]);

    useEffect(() => {
        let stream = null;
        let cancelled = false;

        const startMedia = async () => {
            try {
                const savedCameraState = localStorage.getItem("meetSphere_cameraOn");
                const savedMicState = localStorage.getItem("meetSphere_micOn");
                const shouldStartCamera = savedCameraState === null || savedCameraState === "true";
                const shouldStartMic = savedMicState === null || savedMicState === "true";
                const newStream = await navigator.mediaDevices.getUserMedia({ video: shouldStartCamera, audio: true });
                if (cancelled) {
                    newStream.getTracks().forEach((track) => track.stop());
                    return;
                }
                const audioTrack = newStream.getAudioTracks()[0];
                if (audioTrack) {
                    audioTrack.enabled = shouldStartMic;
                }
                stream = newStream;

                setLocalStream(newStream);
                setMicOn(shouldStartMic);

                const videoTrack = newStream.getVideoTracks()[0];
                if (videoTrack) {
                    setCameraOn(true);
                } else {
                    setCameraOn(false);
                }

            } catch (error) {
                console.error("Camera/Microphone Error:", error);
                setCameraOn(false);
                setMicOn(false);
            }
        };

        startMedia();
        return () => {
            cancelled = true;

            if (stream) {
                stream.getTracks().forEach((track) => { track.stop(); });
            }
        };
    }, []);


    useEffect(() => {
        const video = localVideoRef.current;
        if (!video || !localStream) {
            return;
        }
        video.srcObject = localStream;
        video.onloadedmetadata = async () => {
            try {
                await video.play();
            } catch (error) {
                console.error("Video play error:", error);
            }
        };
        return () => {
            video.onloadedmetadata = null;
        };

    }, [localStream, cameraOn]);

    useEffect(() => {
        if (!localStream || !micOn) {
            setIsSpeaking(false);
            return;
        }
        const audioTrack = localStream.getAudioTracks()[0];
        if (!audioTrack) {
            setIsSpeaking(false);
            return;
        }
        const audioStream = new MediaStream([audioTrack]);
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        const microphone = audioContext.createMediaStreamSource(audioStream);
        microphone.connect(analyser);
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        const dataArray = new Uint8Array(
            analyser.frequencyBinCount
        );

        const detectSound = () => {
            if (!analyserRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            if (average > 12 && micOn) {
                setIsSpeaking(true);
            } else {
                setIsSpeaking(false);
            }
            animationFrameRef.current = requestAnimationFrame(detectSound);
        };

        detectSound();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            audioContextRef.current = null;
            analyserRef.current = null;
            setIsSpeaking(false);
        };
    }, [localStream, micOn]);

    const createPeerConnection = (remoteSocketId) => {
        if (peerConnectionsRef.current[remoteSocketId]) {
            return peerConnectionsRef.current[remoteSocketId];
        }
        const peerConnection = new RTCPeerConnection(rtcConfig);
        if (localStreamRef.current) {
            localStreamRef.current
                .getTracks()
                .forEach((track) => {
                    peerConnection.addTrack(
                        track,
                        localStreamRef.current
                    );
                });
        }
        peerConnection.ontrack = (event) => {
            console.log(
                "REMOTE STREAM TRACKS:",
                event.streams[0]?.getTracks().map(track => ({
                    kind: track.kind,
                    id: track.id,
                    enabled: track.enabled,
                    readyState: track.readyState
                }))
            );
            const remoteStream = event.streams[0];
            if (!remoteStream) {
                return;
            }
            setRemoteStreams((prev) => {
                const existing = prev.find(
                    (item) => item.socketId === remoteSocketId
                );
                if (existing) {
                    return prev.map((item) =>
                        item.socketId === remoteSocketId
                            ? {
                                ...item,
                                stream: remoteStream,
                            }
                            : item
                    );
                }
                return [
                    ...prev,
                    {
                        socketId: remoteSocketId,
                        stream: remoteStream,
                        fullName:
                            remoteNamesRef.current[
                            remoteSocketId
                            ] || "Participant",
                    },
                ];
            });
        };
        peerConnection.onicecandidate = (event) => {
            if (!event.candidate) {
                return;
            }
            socket.emit("ice-candidate", {
                to: remoteSocketId,
                candidate: event.candidate,
            });
        };

        peerConnection.onconnectionstatechange = () => {
            console.log("WebRTC connection:", remoteSocketId, peerConnection.connectionState);

            if (peerConnection.connectionState === "failed" || peerConnection.connectionState === "closed" || peerConnection.connectionState === "disconnected") {
                peerConnection.close();
                delete peerConnectionsRef.current[remoteSocketId];
                setRemoteStreams((prev) =>
                    prev.filter(
                        (item) => item.socketId !== remoteSocketId
                    )
                );
            }
        };

        peerConnectionsRef.current[remoteSocketId] = peerConnection;
        return peerConnection;
    };


    useEffect(() => {

        const handleParticipantJoined =
            async (data) => {
                const { socketId, userId, fullName, cameraOn, } = data;

                setLiveParticipants((prev) => {
                    if (prev.some((person) => person.socketId === socketId)) {
                        return prev;
                    }

                    return [
                        ...prev,
                        { socketId, userId, fullName: fullName || "Participant", cameraOn: cameraOn ?? true, },
                    ];
                });
                remoteNamesRef.current[socketId] = fullName || "Participant";
                setRemoteCameraStates(
                    (prev) => ({
                        ...prev,
                        [socketId]:
                            cameraOn ?? true,
                    })
                );
                const peerConnection = createPeerConnection(socketId);
                try {
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);
                    socket.emit("offer", { to: socketId, offer, });
                } catch (error) {

                    console.error("Offer creation error:", error);
                }
            };

        socket.on("participant_joined", handleParticipantJoined);
        return () => {
            socket.off("participant_joined", handleParticipantJoined);
        };

    }, []);

    useEffect(() => {

        const handleOffer = async ({ from, offer }) => {
            const peerConnection = createPeerConnection(from);
            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(offer)
            );
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(
                answer
            );
            socket.emit("answer", { to: from, answer, });
        };
        socket.on("offer", handleOffer);
        return () => {
            socket.off("offer", handleOffer);
        };

    }, [localStream]);

    useEffect(() => {

        const handleAnswer =
            async ({ from, answer }) => {
                const peerConnection = peerConnectionsRef.current[from];
                if (!peerConnection) {
                    return;
                }
                await peerConnection.setRemoteDescription(
                    new RTCSessionDescription(answer)
                );

            };
        socket.on("answer", handleAnswer);
        return () => {
            socket.off("answer", handleAnswer);
        };

    }, []);

    useEffect(() => {

        const handleIceCandidate =
            async ({ from, candidate }) => {

                const peerConnection =
                    peerConnectionsRef.current[
                    from
                    ];
                if (!peerConnection) {
                    return;
                }
                try {
                    await peerConnection.addIceCandidate(
                        new RTCIceCandidate(candidate)
                    );

                } catch (error) {
                    console.error(
                        "ICE candidate error:",
                        error
                    );
                }
            };
        socket.on(
            "ice-candidate",
            handleIceCandidate
        );
        return () => {
            socket.off(
                "ice-candidate",
                handleIceCandidate
            );

        };

    }, []);

    useEffect(() => {
        const handleCameraStateChanged = ({ socketId, cameraOn, }) => {
            setRemoteCameraStates((prev) => ({
                ...prev,
                [socketId]: cameraOn,
            }));
        };

        socket.on(
            "camera_state_changed",
            handleCameraStateChanged
        );

        return () => {
            socket.off(
                "camera_state_changed",
                handleCameraStateChanged
            );
        };
    }, []);

    useEffect(() => {
        console.log("WAITING USERS UPDATED:", waitingUsers);
    }, [waitingUsers]);

    const isAlreadyParticipant = participants.some(
        (participant) =>
            participant.userId?._id?.toString() ===
            user?.id?.toString()
    );

    useEffect(() => {
        if (!meeting) return;
        console.log(" Meeting loaded, participant check complete");
        setParticipantChecked(true);
    }, [meeting]);


    useEffect(() => {

        const handleNewMessage = (message) => {
            dispatch(
                addMessage(message)
            );
        };
        const handleChatError = (data) => {
            console.error(
                " CHAT ERROR:",
                data
            );
        };
        socket.on(
            "new_meeting_message",
            handleNewMessage
        );
        socket.on(
            "chat_error",
            handleChatError
        );
        return () => {
            socket.off(
                "new_meeting_message",
                handleNewMessage
            );
            socket.off(
                "chat_error",
                handleChatError
            );

        };

    }, [dispatch]);

    const handleSendMessage = () => {

        const text = messageText.trim();
        if (!text) {
            return;
        }
        if (!isAdmitted) {
            console.log(
                "USER IS NOT ADMITTED"
            );
            return;
        }

        if (!socket.connected) {
            console.log(
                "SOCKET NOT CONNECTED"
            );
            return;
        }

        socket.emit(
            "send_meeting_message",
            {
                meetingId: roomId,
                userId: user.id,
                text,
            }
        );

        setMessageText("");
    };

    useEffect(() => {
        const handleParticipantsUpdated = (participants) => {
            setLiveParticipants(Array.isArray(participants) ? participants : []);
        };

        socket.on(
            "meeting_participants_updated",
            handleParticipantsUpdated
        );

        return () => {
            socket.off(
                "meeting_participants_updated",
                handleParticipantsUpdated
            );
        };
    }, []);


    useEffect(() => {
        const handleHandRaiseUpdated = (data) => {
            setLiveParticipants((prev) => {
                const exists = prev.some(
                    (person) => person.socketId === data.socketId
                );
                if (!exists) {
                    return [
                        ...prev,
                        {
                            socketId: data.socketId,
                            userId: data.userId,
                            fullName: data.fullName || "Participant",
                            isHandRaised: data.isHandRaised,
                        },
                    ];
                }

                return prev.map((person) =>
                    person.socketId === data.socketId ? { ...person, isHandRaised: data.isHandRaised } : person
                );
            });
        };

        socket.on("hand_raise_updated", handleHandRaiseUpdated);
        return () => {
            socket.off("hand_raise_updated", handleHandRaiseUpdated);
        };
    }, []);


    const handleChatKeyDown = (e) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
            e.preventDefault();
            handleSendMessage();
        }
    };


    useEffect(() => {
        if ( chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages]);

    if (loading) {
        return (
            <div className="meeting-loading">
                Loading meeting...
            </div>
        );
    }

    if (error) {
        return (
            <div className="meeting-error">
                <h2>{error}</h2>
                <button onClick={() => navigate("/")}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!meeting) {
        return (
            <div
                className="meeting-error"
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "16px",
                    background: "#202124",
                    color: "#ffffff",
                    padding: "24px",
                    textAlign: "center",
                }} >
                <h2>Unable to load meeting</h2>
                <p>
                    {error || "Meeting details are not available. Please try again."}
                </p>
                <button onClick={() => navigate("/")}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!isHost && !isAdmitted) {

        return (
            <div className="meeting-waiting-screen">
                <div className="waiting-box">
                    <div className="waiting-icon">
                        <FaUsers />
                    </div>
                    {joinDenied ? (
                        <>
                            <h2>
                                Request denied
                            </h2>
                            <p>
                                The host denied your request
                                to join this meeting.
                            </p>
                            <button
                                onClick={() =>
                                    navigate("/")
                                }
                            >
                                Back to Home
                            </button>
                        </>
                    ) : (
                        <>
                            <h2>
                                Asking to join...
                            </h2>

                            <p>
                                Your request has been sent
                                to the meeting host.
                            </p>

                            <span>
                                Please wait for the host
                                to admit you.
                            </span>
                        </>
                    )}

                </div>

            </div>
        );
    }
    return (
        <div className="meeting-page">

            <header className="meeting-header">
                {isHost && joinRequests.length > 0 && (
                    <div className="join-request-notification">
                        <div className="join-request-icon">
                            <FaUserPlus />
                        </div>

                        <div className="join-request-details">
                            <strong>
                                {joinRequests.length === 1
                                    ? `${joinRequests[0].fullName} wants to join`
                                    : `${joinRequests.length} people want to join`}
                            </strong>

                            <span>
                                Waiting for your permission
                            </span>
                        </div>

                        <button
                            className="join-admit-btn"
                            onClick={() => handleAdmitRequest(joinRequests[0])}
                        >
                            Admit
                        </button>

                        <button
                            className="join-deny-btn"
                            onClick={() => handleDenyRequest(joinRequests[0])}
                        >
                            Deny
                        </button>
                    </div>
                )}

                <div className="meeting-brand">

                    <span className="meeting-time">
                        {new Date().toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    </span>

                    <span className="meeting-code">
                        {meeting.meetingId}
                    </span>

                    <button className="meeting-info-btn">
                        <FaInfoCircle />
                    </button>

                </div>

                <div className="meeting-header-actions">


                    {isHandRaised && (
                        <div className="header-hand-raised">
                            <FaHandPaper />
                            <span>{user.fullName || "You"}</span>
                        </div>
                    )}

                    <button
                        className={`header-icon-btn ${activePanel === "participants" ? "active-header-btn" : ""
                            }`}
                        onClick={() => {
                            console.log("PEOPLE BUTTON CLICKED");
                            togglePanel("participants");
                        }}
                        title="People"
                    >
                        <FaUsers />
                    </button>

                </div>

            </header>

            <main className="meeting-main">
                <div className="video-area video-grid " >

                    <div className="video-card local-video">
                        {localStream ? (
                            <>
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className={`local-video-element ${!cameraOn ? "video-hidden" : ""
                                        }`}
                                />
                                {!cameraOn && (
                                    <div className="camera-off-overlay">
                                        <div className="user-avatar">
                                            {user.fullName
                                                ? user.fullName.charAt(0).toUpperCase()
                                                : "M"}
                                        </div>
                                        <span>Camera Off</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="camera-off-overlay">
                                <div className="user-avatar">
                                    {user.fullName
                                        ? user.fullName.charAt(0).toUpperCase()
                                        : "M"}
                                </div>

                                <span>Camera unavailable</span>
                            </div>
                        )}

                        {micOn && (
                            <div
                                className={`audio-indicator ${isSpeaking ? "speaking" : ""
                                    }`}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        )}
                        {isHandRaised && (
                            <div className="video-hand-raised" title="Hand raised">
                                <FaHandPaper />
                            </div>
                        )}
                        <div className="video-name">
                            {micOn ? (
                                <FaMicrophone />
                            ) : (
                                <FaMicrophoneSlash />
                            )}

                            {user.fullName || "You"}
                        </div>

                    </div>

                    {remoteStreams.map((remote) => {

                        const remoteCameraOn =
                            remoteCameraStates[remote.socketId] ?? true;

                        return (
                            <div
                                className="video-card"
                                key={remote.socketId}
                            >

                                {remoteCameraOn ? (
                                    <video
                                        autoPlay
                                        playsInline
                                        className="remote-video"
                                        ref={(video) => {
                                            if (video) {
                                                remoteVideoRefs.current[
                                                    remote.socketId
                                                ] = video;

                                                video.srcObject = remote.stream;
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="camera-off-ui">
                                        <div className="camera-off-avatar">
                                            <FaUser />
                                        </div>

                                        <div className="camera-off-text">
                                            Camera off
                                        </div>
                                    </div>
                                )}

                                {liveParticipants.some(
                                    (person) =>
                                        person.socketId === remote.socketId &&
                                        person.isHandRaised
                                ) && (
                                        <div className="video-hand-raised" title="Hand raised">
                                            <FaHandPaper />
                                        </div>
                                    )}

                                <div className="video-name">
                                    <FaMicrophone />
                                    {remote.fullName || "Participant"}
                                </div>

                                <div className="camera-status-icon">
                                    {remoteCameraOn ? (
                                        <FaVideo />
                                    ) : (
                                        <FaVideoSlash />
                                    )}
                                </div>

                            </div>
                        );
                    })}
                </div>

                {activePanel === "chat" && (
                    <ChatPanel setActivePanel={setActivePanel} chatMessagesRef={chatMessagesRef} messages={messages} user={user} messageText={messageText} setMessageText={setMessageText} handleChatKeyDown={handleChatKeyDown} isAdmitted={isAdmitted} sendingMessage={sendingMessage} handleSendMessage={handleSendMessage}/>
                )}

                {activePanel === "participants" && (
                    <PeoplePanel setActivePanel={setActivePanel} isHost={isHost} waitingUsers={waitingUsers} handleAdmitRequest={handleAdmitRequest} showParticipants={showParticipants} setShowParticipants={setShowParticipants} liveParticipants={liveParticipants} user={user}/>
                )}

                {activePanel === "more" && (
                    <div className="more-menu">
                        <div className="more-menu-title">
                            More Options
                        </div>

                        <button>
                            <FaFile />
                            Share File
                        </button>

                        <button>
                            <FaCircle />
                            Start Recording
                        </button>

                        <button>
                            <FaShieldAlt />
                            Meeting Permissions
                        </button>

                    </div>

                )}

            </main>

            <div className="meeting-controls">
                <div className="control-group">

                    <button
                        className={`control-btn ${!micOn ? "control-off" : ""}`}
                        onClick={handleMicToggle}
                        title={
                            micOn
                                ? "Mute microphone"
                                : "Unmute microphone"
                        }
                    >
                        {micOn ? (
                            <FaMicrophone />
                        ) : (
                            <FaMicrophoneSlash />
                        )}


                    </button>

                    <button
                        className={`control-btn ${!cameraOn ? "control-off" : ""}`}
                        onClick={handleCameraToggle}
                        title={cameraOn ? "Turn off camera" : "Turn on camera"}
                    >
                        {cameraOn ? <FaVideo /> : <FaVideoSlash />}
                    </button>

                    <button
                        className="control-btn"
                        title="Share screen"
                    >
                        <FaDesktop />

                    </button>

                    <button
                        className={`control-btn ${isHandRaised ? "hand-active" : ""}`}
                        onClick={toggleHandRaise}
                        title={isHandRaised ? "Lower hand" : "Raise hand"}
                    >
                        <FaHandPaper />
                    </button>

                    <button
                        className={`control-btn ${activePanel === "chat"
                            ? "control-active"
                            : ""
                            }`}
                        onClick={() =>
                            togglePanel("chat")
                        }
                        title="Chat"
                    >
                        <FaComments />

                    </button>
                    <button
                        className="emoji-control-btn"
                        title="Emoji"
                    >
                        😊
                    </button>
                    <button
                        className={`control-btn ${activePanel === "more"
                            ? "control-active"
                            : ""
                            }`}
                        onClick={() =>
                            togglePanel("more")
                        }
                        title="More"
                    >
                        <FaEllipsisV />

                    </button>

                    <button
                        className="leave-btn"
                        onClick={handleLeaveMeeting}
                    >
                        <i className="fa-solid fa-phone"></i>
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Meeting;