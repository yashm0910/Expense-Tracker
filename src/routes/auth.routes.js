const express = require("express")
const router = express.Router()

const authController = require("../controllers/user.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const validate = require("../middlewares/validate.middleware");
const { registerSchema, loginSchema ,updateUserSchema} = require("../validators/auth.validator");
const {authLimiter} = require("../middlewares/rateLimit.middleware");


router.post("/register",authLimiter, validate(registerSchema), authController.registerUser);
router.post("/login",authLimiter, validate(loginSchema), authController.loginUser);

router.get("/findAllUsers", authController.findAllUsers);

router.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "You are logged in",
        user: {
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email
        }
    });
});

router.patch("/me",authMiddleware,validate(updateUserSchema), authController.updateMe)

module.exports = router;