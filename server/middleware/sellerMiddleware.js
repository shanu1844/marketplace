const User = require("../models/User");

const sellerOnly = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    const user = await User.findById(req.user.userId).select("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only approved sellers can access this feature",
      });
    }

    next();
  } catch (error) {
    console.error("Seller middleware error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { sellerOnly };
