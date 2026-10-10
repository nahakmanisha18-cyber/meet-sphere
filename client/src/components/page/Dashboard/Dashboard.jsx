
import React from "react";
import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { FaVideo, FaLink, FaCalendarAlt, FaClock, FaArrowRight, FaUserCircle, FaBell, FaHistory, FaUsers, FaCopy, FaMicrophone, FaDesktop, FaComment } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createMeeting } from "../../../redux/action/meetingAction";
import "./Dashboard.css";
import Header from "../../Header/Header";

const Dashboard = () => {

    const [user, setUser] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [meetingIdInput, setMeetingIdInput] = useState("");
    const [joinError, setJoinError] = useState("");
    const [showMeetingPopup, setShowMeetingPopup] = useState(false);
    const [createdMeeting, setCreatedMeeting] = useState(null);
    const [copied, setCopied] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading: meetingLoading, error } = useSelector((state) => state.meeting);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    useEffect(() => {
        const getMe = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setUser(null);
                setDashboardLoading(false);
                return;
            }

            try {
                const response = await api.get("/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error("GET ME ERROR:", error);

                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
            } finally {
                setDashboardLoading(false);
            }
        };

        getMe();
    }, []);


    const handleNewMeeting = async () => {

        const result = await dispatch(createMeeting());
        if (createMeeting.fulfilled.match(result)) {
            const meeting = result.payload.meeting;
            setCreatedMeeting(meeting);
            setCopied(false);
            setShowMeetingPopup(true);
        }
    };

    const handleCopyMeetingLink = async () => {
        if (!createdMeeting?.meetingId) {
            return;
        }
        const meetingLink = `${window.location.origin}/meeting/${createdMeeting.meetingId}`;

        try {

            await navigator.clipboard.writeText(meetingLink);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error("COPY ERROR:", error);
        }
    };

    const handleJoinCreatedMeeting = () => {
        if (!createdMeeting?.meetingId) {
            return;
        }
        setShowMeetingPopup(false);
        navigate(`/meeting/${createdMeeting.meetingId}`);
    };

    const handleJoinMeeting = () => {
        setMeetingIdInput("");
        setJoinError("");
        setShowJoinModal(true);
    };

    const handleJoinSubmit = async () => {
        const meetingId = meetingIdInput.trim();
        if (!meetingId) {
            setJoinError("Please enter Meeting ID");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const response = await api.post(
                "/meetings/join",
                {
                    meetingId: meetingId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setShowJoinModal(false);
                navigate(`/meeting/${response.data.meeting.meetingId}`);
            }

        } catch (error) {
            console.error("JOIN MEETING ERROR:", error);
            setJoinError(
                error.response?.data?.message ||
                "Unable to join meeting."
            );
        }
    };


    if (dashboardLoading) {

        return (
            <div className="dashboard-loading">
                Loading...
            </div>
        );
    }

    return (

        <div className="home-page">
            <Header user={user} onLogout={() => setUser(null)} />
            <main className="home-container">
                {showMeetingPopup && createdMeeting && (
                    <div className="meeting-info-overlay">
                        <div className="meeting-info-popup">
                            <button className="meeting-popup-close" onClick={() => setShowMeetingPopup(false)} >
                                ×
                            </button>
                            <h2>
                                Here's your joining
                                <br />
                                information
                            </h2>
                            <p className="meeting-popup-description">
                                Send this to people that you want to meet
                                with. Make sure that you save it so that you
                                can use it later, too.
                            </p>

                            <div className="meeting-link-box">

                                <span>
                                    {window.location.host}/meeting/
                                    {createdMeeting.meetingId}
                                </span>

                                <button onClick={handleCopyMeetingLink} title="Copy meeting link">
                                    <FaCopy />
                                </button>
                            </div>
                            {copied && (
                                <div className="copy-success">
                                    Meeting link copied!
                                </div>
                            )}
                            <div className="meeting-id-text">
                                Meeting ID:{" "}
                                <strong>
                                    {createdMeeting.meetingId}
                                </strong>
                            </div>
                            <div className="meeting-popup-actions">

                                <button className="popup-close-btn" onClick={() => setShowMeetingPopup(false)}>
                                    Close
                                </button>
                                <button className="popup-join-btn" onClick={handleJoinCreatedMeeting}>
                                    <FaVideo />
                                    Join now
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {showJoinModal && (
                    <div className="join-modal-overlay">
                        <div className="join-modal">

                            <button className="join-modal-close" onClick={() => setShowJoinModal(false)}>
                                ×
                            </button>
                            <div className="join-modal-icon">
                                <FaLink />
                            </div>
                            <h2>Join Meeting</h2>
                            <p>
                                Enter the Meeting ID shared with you
                            </p>
                            <input type="text" placeholder="Enter Meeting ID" value={meetingIdInput}
                                onChange={(e) => {
                                    setMeetingIdInput(e.target.value);
                                    setJoinError("");
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleJoinSubmit();
                                    }
                                }}
                                autoFocus />

                            {joinError && (
                                <span className="join-error">
                                    {joinError}
                                </span>
                            )}

                            <div className="join-modal-actions">
                                <button className="cancel-join-btn" onClick={() => setShowJoinModal(false)}>
                                    Cancel
                                </button>
                                <button className="confirm-join-btn" onClick={handleJoinSubmit}>
                                    <FaVideo />
                                    Join Meeting
                                </button>

                            </div>

                        </div>
                    </div>
                )}
                <section className="welcome-section">
                    <div className="welcome-content">
                        <div className="welcome-badge">
                            <span className="badge-dot"></span>
                            Your meeting space is ready
                        </div>
                        <h1>
                            {user ? (
                                <>
                                    {getGreeting()},
                                    <span> {user.fullName} 👋</span>
                                </>
                            ) : (
                                <>
                                    Good Morning,
                                    <span> Everyone 👋</span>
                                </>
                            )}
                        </h1>

                        <p> Connect with your team, friends and clients through simple and secure video meetings.</p>

                        <div className="welcome-actions">
                            {user ? (
                                <>
                                    <button className="new-meeting-btn" onClick={handleNewMeeting} disabled={meetingLoading}>
                                        <FaVideo />
                                        {meetingLoading ? "Creating..." : "New Meeting"}
                                    </button>

                                    <button className="join-meeting-btn" onClick={handleJoinMeeting}>
                                        <FaLink />
                                        Join Meeting
                                    </button>
                                </>
                            ) : (
                                <button className="new-meeting-btn" onClick={() => navigate("/login")}>
                                    <FaVideo />
                                    Get Started
                                </button>
                            )}
                        </div>

                    </div>
                    <div className="meeting-preview">

                        <div className="preview-header">
                            <div>
                                <span className="preview-status"></span>
                                MeetSphere
                            </div>
                            <span className="preview-time">
                                Live
                            </span>
                        </div>
                        <div className="preview-screen">
                            <div className="preview-avatar">
                                {user?.fullName
                                    ? user.fullName.charAt(0).toUpperCase()
                                    : "M"}
                            </div>
                            <div className="preview-name">
                                {user?.fullName || "You"}
                            </div>
                            <div className="preview-video-label">
                                <FaVideo />
                                Video meeting ready
                            </div>
                        </div>

                        <div className="preview-controls">
                            <span title="Microphone">  <FaMicrophone /></span>
                            <span title="Camera">  <FaVideo /></span>
                            <span title="Screen Share">  <FaDesktop /></span>
                            <span title="Chat">  <FaComment /></span>
                        </div>
                    </div>
                </section>
            </main>
        </div>

    );

};


export default Dashboard;
