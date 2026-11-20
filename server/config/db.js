const mongoose = require("mongoose");
const dns = require("dns");

// Use public DNS only during local development
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connection successful");
};

module.exports = connectDB;