
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        "Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in server/.env"
      );
    }

    if (password.length < 12) {
      throw new Error("Admin password must contain at least 12 characters");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "This email already exists. Use a different email or handle the existing account securely."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log(`Admin created successfully: ${admin.email}`);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
