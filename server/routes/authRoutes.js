const express = require("express");

const {registerUser,
    loginUser,
    getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 10* 1000,
  limit: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
const router  = express.Router();

router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.get("/me",protect,getMe);
module.exports = router;