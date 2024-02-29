//Imports
const mongoose = require("mongoose");

//creating checklist Schema
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
    },
    status: {
        type: String,
        default: "todo"
    },
    refUserId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },

}, { timestamps: true });

//exporting Task model 
module.exports = mongoose.model("Task", taskSchema);