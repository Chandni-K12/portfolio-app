const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../middleware/authMiddleware");

// Helper to generate JWT Token with 1 hour expiration
const generateToken = (id, email) => {
    return jwt.sign({ id, email }, JWT_SECRET, {
        expiresIn: "1h"
    });
};

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        const token = generateToken(user._id, user.email);

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
};

// @route   POST /auth/login
// @desc    Authenticate user & get token
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id, user.email);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};

// @route   GET /auth/me
// @desc    Get logged in user details
// @access  Private
const getMe = async (req, res) => {
    try {
        res.status(200).json({
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe
};
