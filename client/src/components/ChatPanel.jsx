
import {
    FaTimes,
    FaComments,
    FaPaperPlane,
} from "react-icons/fa";

const ChatPanel = ({
    setActivePanel,
    chatMessagesRef,
    messages,
    user,
    messageText,
    setMessageText,
    handleChatKeyDown,
    isAdmitted,
    sendingMessage,
    handleSendMessage,
}) => {

    return (
        <aside className="meeting-chat-panel">
            <div className="meeting-chat-header">

                <div>
                    <h3>
                        In-call messages
                    </h3>
                </div>
                <button
                    className="chat-close-btn"
                    onClick={() =>
                        setActivePanel(null)
                    }
                >
                    <FaTimes />
                </button>

            </div>

            <div className="chat-info-box">

                <div className="chat-info-icon">
                    <FaComments />
                </div>
                <div>
                    <div className="chat-info-title">
                        Continuous chat is turned off
                    </div>
                    <div className="chat-info-text">
                        Messages will not be saved for
                        meeting participants when the
                        call ends. You can pin a message
                        to make it visible for people
                        who join later.

                    </div>
                </div>

            </div>
            <div
                className="meeting-chat-messages"
                ref={chatMessagesRef}
            >
                {messages.map(
                    (msg, index) => {
                        const senderId =
                            msg.senderId?._id ||
                            msg.senderId;
                        const isMine = senderId?.toString() === user?.id?.toString();
                        return (
                            <div key={
                                msg._id ||
                                index
                            }
                                className={`meeting-message ${isMine
                                    ? "message-own"
                                    : "message-other"
                                    }`}
                            >
                                {!isMine && (
                                    <div className="message-avatar">
                                        {msg.senderId
                                            ?.profileImage ? (
                                            <img
                                                src={
                                                    msg
                                                        .senderId
                                                        .profileImage
                                                }
                                                alt=""
                                            />

                                        ) : (

                                            <span>
                                                {(
                                                    msg
                                                        .senderId
                                                        ?.fullName ||
                                                    "U"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>

                                        )}

                                    </div>

                                )}
                                <div className="message-content">

                                    {!isMine && (
                                        <div className="message-sender">
                                            {
                                                msg.senderId
                                                    ?.fullName ||
                                                "Participant"
                                            }

                                            <span>
                                                {new Date(
                                                    msg.createdAt
                                                ).toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                )}
                                            </span>

                                        </div>

                                    )}
                                    {isMine && (
                                        <div className="message-own-time">

                                            {new Date(
                                                msg.createdAt
                                            ).toLocaleTimeString(
                                                [],
                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }
                                            )}

                                        </div>

                                    )}
                                    <div className="message-bubble">
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                )}
            </div>

            <div className="meeting-chat-input">
                <input
                    type="text"
                    value={messageText}
                    onChange={(e) =>
                        setMessageText(
                            e.target.value
                        )
                    }
                    onKeyDown={
                        handleChatKeyDown
                    }
                    placeholder="Send a message"
                    disabled={
                        !isAdmitted ||
                        sendingMessage
                    }
                />
                <button
                    onClick={
                        handleSendMessage
                    }
                    disabled={
                        !messageText.trim() ||
                        !isAdmitted
                    }
                >
                    <FaPaperPlane />
                </button>
            </div>
        </aside>
    )
}

export default ChatPanel;