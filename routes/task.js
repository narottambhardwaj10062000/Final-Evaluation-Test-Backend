//Imports
const express = require("express");
const router = express.Router();
const Task = require("../models/task.js");
const verifyjwt = require("../middlewares/authMiddleware.js");

//Create Task API
router.post("/create", verifyjwt, async (req, res) => {
  try {
    //Getting data from request body
    const { title, checkList, priority, dueDate } = req.body;

    //validation
    if ( !title || !priority || !dueDate || !checkList ) {
      return res.status(400).json({
        errorMessage: "Bad Request",
      });
    }

    //Adding data to the database
    const taskData = await Task.create({
      title,
      checkList,
      priority,
      dueDate,
    });

    //sending JSON response
    res.status(200).json({
      success: "true",
      message: "Task added successfully",
      taskTitle: taskData.title,
    });
  } catch (error) {
    console.log(error);
  }
});

//Get All Tasks API
router.get("/all", async (req, res) => {

  // console.log(req.query.filter);

  //getting all tasks from database
  const taskList = await Task.find({});
  const newTaskList = [...taskList];

  // console.log(newTaskList);
  // console.log(typeof newTaskList);

  //sending the tasklist as JSON response
  res.json({
    data: taskList,
  });
});

//Edit Task API
router.put("/edit/:taskId", verifyjwt, async (req, res) => {
  try {
    //getting data from request body
    const { editTitle, editedChecklist, editPriority, editDueDate } = req.body;
    const title = editTitle;
    const checkList = editedChecklist;
    const priority = editPriority;
    const dueDate = editDueDate;
    const taskId = req.params.taskId;

    //validation
    if (!title || !checkList || !priority || !dueDate || !taskId) {
      res.status(400).json({
        errorMessage: "Bad Request",
      });
    }

    //updating the entry in database
    const taskDetails = await Task.updateOne(
      { _id: taskId },
      {
        $set: {
          title,
          checkList,
          priority,
          dueDate,
        },
      }
    );

    //sending JSON response
    res.status(200).json({
      message: "Task details updated successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

//Delete Task API
router.delete("/delete/:taskId", verifyjwt, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    // console.log(taskId);

    // const taskList = await deleteById({_id: taskId});
    const taskList = await Task.deleteOne({ _id: taskId });

    res.status(200).json({
      message: "Task Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
  }
});

//Handling update task status API
router.put("/update/:taskId", verifyjwt, async (req, res) => {
  try {
    const status = req.query.status;
    const taskId = req.params.taskId;

    // console.log(taskId);
    // console.log(status);
    // console.log(typeof status);

    const response = await Task.updateOne(
      { _id: taskId },
      { $set: { status: status } }
    );

    res.json({
      message: "status updated successfully"
    })


  } catch (error) {
    console.log(error);
  }
});

//Exports
module.exports = router;
