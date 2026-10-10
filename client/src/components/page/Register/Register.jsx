import React, { useRef, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../../assets/logo1.png";
import { useNavigate } from "react-router-dom";

import api from "../../../api/axios";
import { registervalidateForm } from "../../../utils/validate";

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const fullNameRef = useRef(null);
    const emailRef = useRef(null);
    const mobileRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setServerError("");
        setSuccessMessage("");

        const isValid = registervalidateForm({ fullName, email, mobileNumber, password, confirmPassword, setErrors, fullNameRef, emailRef, mobileRef, passwordRef, confirmPasswordRef });

        if (!isValid) {
            return;
        }
        setLoading(true);

        try {
            const response = await api.post("/auth/register", { fullName: fullName.trim(), email: email.trim().toLowerCase(), mobileNumber: mobileNumber.trim(), password, confirmPassword });

            setSuccessMessage("Account created successfully. Please login.");
            setFullName("");
            setEmail("");
            setMobileNumber("");
            setPassword("");
            setConfirmPassword("");
            setErrors({});

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (error) {
            console.log("REGISTER ERROR:", error);
            const status = error.response?.status;
            const message = error.response?.data?.message;

            if (status === 409) {
                setServerError("User already exists. Please login.");
            } else if (status === 400) {
                setServerError(message || "Please check your details.");
            } else {
                setServerError(message || "Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="meet-login-page">

            <div className="meet-login-container">
                <div className="meet-login-left">

                    <span className="meet-shape meet-shape-one"></span>
                    <span className="meet-shape meet-shape-two"></span>
                    <span className="meet-shape meet-shape-three"></span>

                    <div className="meet-left-content">
                        <div className="meet-logo-box">
                            <img src={logo} alt="MeetSphere" />
                        </div>
                        <div className="meeting-illustration">
                            <div className="video-circle">
                                <div className="video-camera">
                                    <span></span>
                                </div>
                            </div>
                            <div className="meeting-card meeting-card-top">
                                <div className="participant-avatar">
                                </div>
                                <div>
                                    <strong>Manisha</strong>
                                    <small>Online</small>
                                </div>
                                <span className="online-dot"></span>
                            </div>

                            <div className="meeting-card meeting-card-bottom">
                                <div className="mini-avatars">
                                    <span>J</span>
                                    <span>S</span>
                                    <span>R</span>
                                </div>

                                <div>
                                    <strong>Team Meeting</strong>
                                    <small>3 participants</small>
                                </div>
                                <span className="meeting-check">
                                    ✓
                                </span>
                            </div>
                        </div>
                        <div className="meet-intro">

                            <h1>
                                Connect.
                                <br />
                                Collaborate.
                                <span> Meet.</span>
                            </h1>
                            <p className="meet-description">
                                Bring your team together with seamless video meetings,
                                real-time conversations, and effortless collaboration.
                                Work smarter, stay connected, and achieve more together
                                from anywhere in the world.
                            </p>

                            <div className="meet-benefits">
                                <div className="meet-benefit">
                                    <div>
                                        <strong>Meet Face to Face</strong>
                                        <p>
                                            Enjoy smooth video meetings with your team.
                                        </p>
                                    </div>
                                </div>

                                <div className="meet-benefit">
                                    <div>
                                        <strong>Stay Connected</strong>
                                        <p>
                                            Share ideas and communicate in real time.
                                        </p>
                                    </div>
                                </div>

                                <div className="meet-benefit">
                                    <div>
                                        <strong>Work Better Together</strong>
                                        <p>
                                            Make teamwork simple, productive, and effective.
                                        </p>
                                    </div>
                                </div>

                            </div>

                            <div className="meet-features">

                                <div className="meet-feature">
                                    <span className="feature-icon">✓</span>
                                    <span>HD Video Meetings</span>
                                </div>

                                <div className="meet-feature">
                                    <span className="feature-icon">✓</span>
                                    <span>Secure Conversations</span>
                                </div>

                                <div className="meet-feature">
                                    <span className="feature-icon">✓</span>
                                    <span>Connect Anywhere</span>
                                </div>

                            </div>

                            <div className="meet-trust-text">
                                One platform. Endless possibilities.
                            </div>

                        </div>


                    </div>

                </div>

                <div className="meet-login-right">

                    <button className="close-login" type="button" onClick={() => navigate("/")}>
                        ×
                    </button>
                    <div className="login-form-wrapper">
                        <div className="login-heading">
                            <h2>Create Account</h2>
                            <p>  Sign up to get started with MeetSphere.</p>
                        </div>

                        {serverError && (
                            <div className="login-server-error">
                                <span>{serverError}</span>
                                {serverError === "User already exists. Please login." && (
                                    <button type="button" onClick={() => navigate("/login")}>
                                        Login
                                    </button>
                                )}
                            </div>
                        )}

                        {successMessage && (
                            <div className="login-success-message">
                                {successMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="name"> Full name </label>
                                <input ref={fullNameRef} type="text" id="name" placeholder="Enter your full name"
                                    value={fullName} onChange={(e) => {
                                        setFullName(e.target.value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            fullName: ""
                                        }));

                                        setServerError("");
                                    }}
                                    className={errors.fullName ? "input-error" : ""} />

                                {errors.fullName && (
                                    <span className="field-error">
                                        {errors.fullName}
                                    </span>
                                )}

                            </div>

                            <div className="input-group">
                                <label htmlFor="email">  Email address</label>
                                <input ref={emailRef} type="email" id="email" placeholder="Enter your email" value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            email: ""
                                        }));
                                        setServerError("");
                                    }}
                                    className={errors.email ? "input-error" : ""} />

                                {errors.email && (
                                    <span className="field-error">
                                        {errors.email}
                                    </span>
                                )}

                            </div>

                            <div className="input-group">

                                <label htmlFor="mobileNumber">  Mobile number</label>

                                <input ref={mobileRef} type="tel" id="mobileNumber" placeholder="Enter 10-digit mobile number" maxLength="10" value={mobileNumber}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value.replace(/\D/g, "");
                                        setMobileNumber(value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            mobileNumber: ""
                                        }));
                                        setServerError("");
                                    }}
                                    className={errors.mobileNumber ? "input-error" : ""} />

                                {errors.mobileNumber && (
                                    <span className="field-error">
                                        {errors.mobileNumber}
                                    </span>
                                )}

                            </div>

                            <div className="input-group">
                                <label htmlFor="password"> Password </label>
                                <div className="password-input">

                                    <input ref={passwordRef} type={showPassword ? "text" : "password"} id="password" placeholder="Create a password" value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setErrors((prev) => ({
                                                ...prev,
                                                password: ""
                                            }));
                                            setServerError("");
                                        }}
                                        className={errors.password ? "input-error" : ""} />

                                    <button type="button" className="show-password"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }>
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>

                                </div>

                                {errors.password && (
                                    <span className="field-error">
                                        {errors.password}
                                    </span>
                                )}

                            </div>

                            <div className="input-group">

                                <label htmlFor="confirmPassword">
                                    Confirm password
                                </label>
                                <div className="password-input">

                                    <input ref={confirmPasswordRef} type={showConfirmPassword ? "text" : "password"} id="confirmPassword" placeholder="Confirm your password" value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(
                                                e.target.value
                                            );
                                            setErrors((prev) => ({
                                                ...prev,
                                                confirmPassword: ""
                                            }));
                                            setServerError("");
                                        }}
                                        className={errors.confirmPassword ? "input-error" : ""} />

                                    <button type="button" className="show-password"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        } >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>

                                </div>

                                {errors.confirmPassword && (
                                    <span className="field-error">
                                        {errors.confirmPassword}
                                    </span>
                                )}

                            </div>

                            <button type="submit" className="login-btn" disabled={loading}>
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>

                        </form>

                        <div className="login-divider">
                            <span></span>
                            <p>or continue with</p>
                            <span></span>
                        </div>

                        <div className="social-login">

                            <button type="button">
                                <span className="google-icon">
                                    <i className="fa-brands fa-google"></i>
                                </span>
                            </button>

                            <button type="button">
                                <span className="github-icon">
                                    <i className="fa-brands fa-github"></i>
                                </span>
                            </button>

                            <button type="button">
                                <span className="linkedin-icon">
                                    <i className="fa-brands fa-linkedin"></i>
                                </span>
                            </button>

                        </div>

                        <div className="register-text">

                            <span>
                                Already have an account?
                            </span>

                            <button type="button" onClick={() => navigate("/login")}>
                                Sign in
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Register;