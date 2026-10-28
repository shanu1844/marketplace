const jwt = require("jsonwebtoken");

const protect = (req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
          // Check whether the Authorization header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }
     // Extract the token after "Bearer "
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }
    if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing");

  return res.status(500).json({
    success: false,
    message: "Internal server configuration error",
  });
}
     // Verify the token using the server secret
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    if (
   !decoded ||
  typeof decoded !== "object" ||
  Array.isArray(decoded) ||
  typeof decoded.userId !== "string" ||
  !decoded.userId.trim() ||
  typeof decoded.role !== "string" ||
  !decoded.role.trim()
) {
  return res.status(401).json({
    success: false,
    message: "Invalid token payload",
  });
}
    // Attach verified identity to the request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    // Continue to the next middleware or controller
    next();
    } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

module.exports ={protect};