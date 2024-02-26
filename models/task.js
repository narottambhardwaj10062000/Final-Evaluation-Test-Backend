//Imports
const mongoose = require("mongoose");

//cresting checklist Schema
const checkListSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
});

//Creating task schema
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    }, 
    checkList: [checkListSchema],
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