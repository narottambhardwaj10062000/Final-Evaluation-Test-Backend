//Imports
const mongoose = require("mongoose");

//Creating task schema
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    }, 
    priority: {
        type: String,
        required: true,
    },
    dueDate: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "todo"
    }
}, { timestamps: true });

//exporting Task model 
module.exports = mongoose.model("Task", taskSchema);