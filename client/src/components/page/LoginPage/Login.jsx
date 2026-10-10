
import React, { useRef, useState } from "react";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../../../assets/logo1.png";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { loginvalidateForm } from "../../../utils/validate";


const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        const isValid = loginvalidateForm({ email, password, setErrors, emailRef, passwordRef });
        if (!isValid) {
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email: email.trim().toLowerCase(),
                password,
            });

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            navigate("/");

        } catch (error) {
            console.log("LOGIN ERROR:", error);
            const status = error.response?.status;
            const message = error.response?.data?.message;

            if (status === 404) {
                setServerError( "User does not exist. Please register." );
            } else if (status === 401) {
                setServerError( "Invalid password." );
            } else {
                setServerError( message || "Login failed. Please try again." );
            }

        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

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
                                <div className="login-participant-avatar">
                                    M
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

                                <span className="meeting-check">✓</span>
                            </div>

                        </div>

                        <div className="meet-intro">

                            <h1>
                                Connect.
                                <br />
                                Collaborate.
                                <span> Meet.</span>
                            </h1>

                            <p>
                                Meet, connect and collaborate with your team
                                from anywhere, anytime.
                            </p>

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

                        </div>

                    </div>
                </div>

                <div className="meet-login-right">

                    <button className="close-login" type="button" onClick={() => navigate("/")}>
                        ×
                    </button>

                    <div className="login-form-wrapper">
                        <div className="login-heading">
                            <h2>Welcome Back!</h2>
                            <p>
                                Sign in to continue to MeetSphere.
                            </p>
                        </div>
                        {serverError && (
                            <div className="login-server-error">
                                <span>{serverError}</span>
                                {serverError === "User does not exist. Please register." && (
                                    <button  type="button"  onClick={() => navigate("/register")}>
                                        Register
                                    </button>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            <div className="input-group">
                                <label htmlFor="email">
                                    Email address
                                </label>

                                <input ref={emailRef} type="email" id="email" placeholder="Enter your email" value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors((prev) => ({
                                            ...prev,
                                            email: "",
                                        }));
                                        setServerError("");
                                    }}
                                    className={errors.email ? "input-error" : ""}
                                />
                                {errors.email && (
                                    <span className="field-error">
                                        {errors.email}
                                    </span>
                                )}

                            </div>

                            <div className="input-group">
                                <div className="password-label">
                                    <label htmlFor="password">
                                        Password
                                    </label>
                                    <button type="button" className="forgot-password">
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="password-input">

                                    <input ref={passwordRef} type={showPassword ? "text" : "password"} id="password" placeholder="Enter your password" value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setErrors((prev) => ({
                                                ...prev,
                                                password: "",
                                            }));
                                            setServerError("");
                                        }}
                                        className={errors.password ? "input-error" : ""}
                                    />
                                    {errors.password && (
                                        <span className="field-error">
                                            {errors.password}
                                        </span>
                                    )}

                                    <button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)} >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                            </div>

                            <button type="submit" className="login-btn">
                                Sign In
                            </button>

                        </form>

                        <div className="login-divider">
                            <span></span>
                            <p>or continue with</p>
                            <span></span>
                        </div>

                        <div className="social-login">

                            <button type="button">
                                <span className="google-icon"><i class="fa-brands fa-google"></i></span>
                            </button>

                            <button type="button">
                                <span className="github-icon"><i class="fa-brands fa-github"></i></span>
                            </button>

                            <button type="button">
                                <span className="github-icon"><i class="fa-brands fa-linkedin"></i></span>
                            </button>

                        </div>
                        <div className="register-text">

                            <span>
                                Don't have an account?
                            </span>

                            <button type="button" onClick={() => navigate("/register")}>
                                Create an account
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;