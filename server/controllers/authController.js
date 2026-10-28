const bcrypt = require("bcryptjs")
const User = require("../models/User")

const registerUser = async(req,res)=>{
    try{
        const{name,email,password}=req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"Name, email and password are required"
            })
        }
        if(typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ){
                return res.status(400).json({
                  success:false,
                  message:"Invalid input types"
                });
            }

             const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2 || normalizedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name must contain 2 to 50 characters",
      });
    }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

      const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }
     const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });
 return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    }
    catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

const loginUser = async(req,res)=>{
  try{
    const{email,password}= req.body
      // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
     // Validate input types
    if (
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input types",
      });
    }
     const normalizedEmail = email.trim().toLowerCase();

    // Find user and explicitly include the password hash
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");
       // Use the same message for unknown email and wrong password
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
     // Compare entered password with stored hash
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    };
    // Generate JWT after successful verification
    const token = require("jsonwebtoken").sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
      // Send safe user information and token
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

const getMe = async(req,res)=>{
  try{
    const user = await User.findById(req.user.userId);
     if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });

}
}


module.exports = { registerUser, loginUser, getMe };