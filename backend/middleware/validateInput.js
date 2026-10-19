const validateRegisterInput = (req, res, next) => {
    const { name, email, password } = req.body || {};

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ message: "Name is required" });
    }

    if (!email || typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    next();
};

const validateLoginInput = (req, res, next) => {
    const { email, password } = req.body || {};

    if (!email || typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({ message: "Email is required" });
    }

    if (!password || typeof password !== "string" || password.trim() === "") {
        return res.status(400).json({ message: "Password is required" });
    }

    next();
};

const validateTaskInput = (req, res, next) => {
    const { title } = req.body || {};

    if (!title || typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ message: "Task title is required and cannot be empty" });
    }

    next();
};

module.exports = {
    validateRegisterInput,
    validateLoginInput,
    validateTaskInput
};
