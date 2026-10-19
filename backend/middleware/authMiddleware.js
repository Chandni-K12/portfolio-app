const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret_key_pr1_2026";

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({
                    message: "Not authorized, user not found"
                });
            }

            return next();
        } catch (error) {
            console.error("JWT Verification Error:", error.message);
            return res.status(401).json({
                message: "Not authorized, token invalid or expired"
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            message: "Access denied. No authentication token provided."
        });
    }
};

const optionalAuth = async (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
        } catch (error) {
            // Ignore error for optional auth, user remains undefined
        }
    }
    next();
};

module.exports = { protect, optionalAuth, JWT_SECRET };
