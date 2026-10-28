const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const cors = require("cors");
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const storeRoutes = require("./routes/storeRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes")
const orderRoutes = require("./routes/orderRoutes");
const app = express();
const PORT = process.env.PORT || 5000;
app.use(helmet());
app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.json())

app.get("/api/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Marketpalace API  is running"
    })
})

app.use("/api/auth",authRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);


const startServer = async()=>{
    await connectDB();

    app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
});

}




startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});