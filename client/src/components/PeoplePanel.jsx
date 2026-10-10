

import {
    FaTimes,
    FaUserPlus,
    FaSearch,
    FaMicrophone,
    FaMicrophoneSlash,
    FaVideo,
    FaVideoSlash,
    FaEllipsisV,
} from "react-icons/fa";
const PeoplePanel = ({
    setActivePanel,
    isHost,
    waitingUsers,
    handleAdmitRequest,
    showParticipants,
    setShowParticipants,
    liveParticipants,
    user,
}) => {

    return (
        <aside className="people-panel">
            <div className="people-panel-header">
                <h2>People</h2>
                <button
                    className="people-close-btn"
                    onClick={() => setActivePanel(null)}
                >
                    <FaTimes />
                </button>
            </div>
            <button className="add-people-btn">
                <FaUserPlus />
                <span>Add people</span>
            </button>
            <div className="people-search">
                <FaSearch />
                <input
                    type="text"
                    placeholder="Search for people"
                />
            </div>
            <div className="people-scroll-area">
                {isHost && waitingUsers.length > 0 && (
                    <section className="people-section">
                        <div className="section-label">
                            WAITING TO JOIN
                        </div>
                        <div className="people-card">
                            <div className="people-card-header">
                                <strong>
                                    Waiting to be admitted
                                </strong>
                                <span>
                                    {waitingUsers.length}
                                </span>
                            </div>
                            <div className="participants-list">
                                {waitingUsers.map((person) => (
                                    <div
                                        className="participant-item waiting-participant"
                                        key={person.socketId}
                                    >
                                        <div className="participant-avatar">
                                            {person.fullName
                                                ?.charAt(0)
                                                ?.toUpperCase() || "U"}
                                        </div>
                                        <div className="participant-info">
                                            <h4>
                                                {person.fullName || "Unknown User"}
                                            </h4>
                                            <span>
                                                Waiting to join
                                            </span>
                                        </div>
                                        <div className="participant-status">
                                            {person.micOn ? (
                                                <FaMicrophone />
                                            ) : (
                                                <FaMicrophoneSlash />
                                            )}
                                            {person.cameraOn ? (
                                                <FaVideo />
                                            ) : (
                                                <FaVideoSlash />
                                            )}

                                        </div>

                                        <button
                                            className="admit-btn"
                                            onClick={() => handleAdmitRequest(person)}
                                        >
                                            Admit
                                        </button>

                                        <button className="person-menu-btn">
                                            <FaEllipsisV />
                                        </button>

                                    </div>

                                ))}

                            </div>

                        </div>

                    </section>
                )}

                <section className="people-section">

                    <div className="section-label">
                        IN THE MEETING
                    </div>

                    <div className="people-card">
                        <button
                            className="people-card-header"
                            onClick={() =>
                                setShowParticipants((prev) => !prev)
                            }
                        >
                            <strong>
                                Contributors
                            </strong>

                            <div className="contributors-right">
                                <span>
                                    {new Set(
                                        liveParticipants.map((person) => person.userId?.toString())
                                    ).size}
                                </span>

                                <span
                                    className={`contributors-arrow ${showParticipants ? "open" : ""
                                        }`}
                                >
                                    ˅
                                </span>

                            </div>
                        </button>


                        {showParticipants && (
                            <div className="participants-list">
                                {liveParticipants.map((person) => {
                                    const isMe =
                                        person.userId?.toString() === user?.id?.toString();

                                    return (
                                        <div
                                            className="participant-item"
                                            key={person.socketId}
                                        >
                                            <div className="participant-avatar">
                                                {person.fullName?.charAt(0)?.toUpperCase() || "U"}
                                            </div>

                                            <div className="participant-info">
                                                <h4>
                                                    {person.fullName || "Participant"}
                                                    {isMe && (
                                                        <span className="you-label"> (You)</span>
                                                    )}
                                                </h4>

                                                <span>
                                                    {person.isHost
                                                        ? "Meeting host"
                                                        : "Participant"}
                                                </span>
                                            </div>

                                            <div className="participant-status">
                                                {person.cameraOn
                                                    ? <FaVideo />
                                                    : <FaVideoSlash />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    </div>

                </section>

            </div>

        </aside>
    )
}

export default PeoplePanel;