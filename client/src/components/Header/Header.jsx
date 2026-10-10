
import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaUserCircle, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo1.png";
import "./Header.css";

const Header = ({ user, onLogout }) => {
    const navigate = useNavigate();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setDropdownOpen(false);
        onLogout?.();

        navigate("/", { replace: true });
    };

    return (
        <header className="home-navbar">
            <div  className="home-logo"  onClick={() => navigate("/")}  style={{ cursor: "pointer" }}>
                <img src={logo} alt="MeetSphere Logo" />
            </div>
            <div className="home-nav-right">
                {user ? (
                    <>
                        <button className="notification-btn" type="button" aria-label="Notifications">
                            <FaBell />
                            <span />
                        </button>
                        <div className="profile-dropdown-wrapper" ref={dropdownRef}>
                            <button className="profile-btn" type="button" onClick={() => setDropdownOpen((prev) => !prev)} aria-expanded={dropdownOpen}>
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt={user.fullName || "Profile"} className="header-profile-image"/>
                                ) : (
                                    <FaUserCircle />
                                )}
                                <div className="profile-text">
                                    <strong>
                                        {user.fullName || "My Account"}
                                    </strong>
                                    <small>My Profile</small>
                                </div>
                            </button>

                            {dropdownOpen && (
                                <div className="profile-dropdown">
                                    <button type="button" onClick={() => {setDropdownOpen(false);navigate("/profile");  }}>
                                        <FaUser />
                                        <span>My Profile</span>
                                    </button>

                                    <button type="button" className="logout-dropdown-btn" onClick={handleLogout}>
                                        <FaSignOutAlt />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <button className="header-login-btn" type="button" onClick={() => navigate("/login")}>
                        Login
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;