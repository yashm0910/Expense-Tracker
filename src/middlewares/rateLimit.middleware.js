const rateLimit = require("express-rate-limit");

// Strict: for auth routes (login, register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                    // 5 requests per IP per window
    message: {
        status: "error",
        message: "Too many attempts. Please try again after 15 minutes."
    },
    standardHeaders: true,     // adds RateLimit-* headers
    legacyHeaders: false
});

// Loose: for general API routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 200,
    message: {
        status: "error",
        message: "Too many requests. Please slow down."
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { authLimiter, apiLimiter };