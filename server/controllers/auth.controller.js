const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const registerUser = async (req, res) => {
    try {
        const { fullName, email, mobileNumber, password } = req.body;
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists. Please login."
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            mobileNumber: mobileNumber.trim(),
            password: hashedPassword
        });
        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                mobileNumber: user.mobileNumber,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User does not exist. Please register."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid password."
            });
        }
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {id: user._id,fullName: user.fullName,email: user.email,mobileNumber: user.mobileNumber,profileImage: user.profileImage,about: user.about,role: user.role}
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Login failed. Please try again."
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId) .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }
       return res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("GET ME ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user."
        });
    }
};

const logout = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Logout successful."
        });

    } catch (error) {
        console.error("LOGOUT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Logout failed."
        });
    }
};

module.exports = {registerUser,loginUser,getMe,logout};