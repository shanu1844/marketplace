require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db")

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json())

app.get("/api/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Marketpalace API  is running"
    })
})

const startServer = async()=>{
    await connectDB();

    app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
});

}




startServer();