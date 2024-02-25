//imports
const mongoose = require("mongoose");

//creating User Schema
const userSchema =  new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
})

//exporting the model
module.exports = mongoose.model("User", userSchema);
