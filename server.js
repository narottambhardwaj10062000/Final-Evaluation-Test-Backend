//IMPORTS
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/auth.js");
const taskRoutes = require("./routes/task.js");
const cors = require('cors');
// const PORT = 6000;

//Creating A Express Server
const app = express();

app.use(express.json());
app.use(cors());

//connect to the database
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {console.log("database connected")})
    .catch((error) => {console.log(error)})

//Initializing Port
const PORT = process.env.PORT || 7000;

//creating a health API to test my server
app.get("/health", (req, res) => {
    res.json({
        service: "Task Management Server",
        status: "Active",
        time: new Date(),
    });
})

//Middlewares
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/task", taskRoutes);  

//making my server listen to a port
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
})


