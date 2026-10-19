const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateRegisterInput, validateLoginInput } = require("../middleware/validateInput");

// POST /register (and /auth/register)
router.post("/register", validateRegisterInput, registerUser);

// POST /login (and /auth/login)
router.post("/login", validateLoginInput, loginUser);

// GET /me (and /auth/me)
router.get("/me", protect, getMe);

module.exports = router;
