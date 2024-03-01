//Imports
const express = require("express");
const router = express.Router();
const Task = require("../models/task.js");
const User = require("../models/auth.js");
const verifyjwt = require("../middlewares/authMiddleware.js");

//Create Task API
router.post("/create", verifyjwt, async (req, res) => {
  try {
    //Getting data from request body
    const { title, checkList, priority, dueDate } = req.body;
    // console.log(checkList.length);

    //validations
    if ( !title || !priority || checkList.length === 0 ) {
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
      refUserId: req.body.userId,
    });

    //sending JSON response
    res.status(200).json({
      success: "true",
      message: "Task added successfully",
      taskTitle: taskData.title,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// <----------------- Get All Task API----------------->
router.get('/alltask/:filter', verifyjwt, async (req, res) => {
  console.log(req.params.filter);
  try {
      const user = await User.findOne({
          _id: req.body.userId
      })

      const today = new Date();

      if (req.params.filter === 'week') {
          const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
          const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);
          const task = await Task.find(
              {
                refUserId: user._id,
                createdDate: {
                      $gte: start,
                      $lt: end
                  }
              }
          ).sort({updatedDate : 1});
          // console.log(task);
          if (task)
              taskFun(task, res, user);
      }

      else if (req.params.filter === 'month') {
          const start = new Date(today.getFullYear(), today.getMonth(), 1);
          const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          const task = await Task.find(
              {
                refUserId: user._id,
                createdDate: {
                      $gte: start,
                      $lt: end
                  }
              }
          ).sort({updatedDate : 1});
          if (task)
              taskFun(task, res, user);
      }

      else if (req.params.filter === 'today') {
          const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          const task = await Task.find(
              {
                refUserId: user._id,
                createdDate: {
                      $gte: start,
                      $lt: end
                  }
              }
          ).sort({updatedDate : 1});
          if (task)
              taskFun(task, res, user);
      }
      else
          res.status(404).send({ message: 'Wrong Parameter' });

  } catch (error) {
      console.log(error)
      res.status(500).send(error);
  }
})

function taskFun(task, res, user) {
  if (task) {
      const Todo = [];
      const Backlog = [];
      const Progress = [];
      const Done = [];

      task.map(item => {
          if (item.status === 'todo')
              Todo.push(item);
          else if (item.status === 'backlog')
              Backlog.push(item);
          else if (item.status === 'progress')
              Progress.push(item);
          else if (item.status === 'done')
              Done.push(item);
      })

      const obj = {
          todo: Todo, backlog: Backlog, progress: Progress, done: Done
      }
      res.status(200).send({ name: user.name, task: obj });
  }
  else
      res.status(203).send({ name: user.name, task: [] });
}


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
    if (!title || !checkList || !priority || !taskId) {
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
          refUserId: req.body.userId
        },
      }
    );

    //sending JSON response
    res.status(200).json({
      message: "Task details updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
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
    res.status(500).json({ message: 'Internal Server Error' });
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
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Handling update checkbox state API
router.put("/updatecheckbox/:taskId", async (req, res) => {
  try {
    const { state } = req.body;
    const taskId = req.params.taskId;
    const checkboxId = req.query.checkboxId;
    // console.log(taskId);
    // console.log(checkboxId);
    
    const task = await Task.findById(taskId);

    if(!task) {
      return res.status(404).json({ error: "Task not found"});
    }

    const checklistItem = task.checkList.id(checkboxId);

    if(!checklistItem) {
      return res.status(404).json({ error: "CheckList item not found" });
    }

    checklistItem.isCompleted = state;
    await task.save();

    res.status(200).json({ message: "Checkbox State updated successfully", checklist: task.checkList });
  } catch ( error ) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// <----------------- Analytics ----------------->
router.get('/analytics', verifyjwt, async (req, res) => {
  try {
      const task = await Task.find(
        {refUserId: req.body.userId}, {}
      )
      console.log(task);
      if (task) {
          const list = [
              {
                  TaskName: 'Backlog Tasks',
                  Number: 0
              },
              {
                  TaskName: 'To-do Tasks',
                  Number: 0,
              },
              {
                  TaskName: 'In-Progress Tasks',
                  Number: 0
              },
              {
                  TaskName: 'Completed Tasks',
                  Number: 0
              },
              {
                  TaskName: 'Low Priority',
                  Number: 0
              },
              {
                  TaskName: 'Moderate Priority',
                  Number: 0
              },
              {
                  TaskName: 'High Priority',
                  Number: 0
              },
              {
                  TaskName: 'Due Date Tasks',
                  Number: 0
              }
          ]

          task.map(item => {
              if (item.status === 'backlog')
              list[0].Number++;
              else if (item.status === 'todo')
              list[1].Number++;
              else if (item.status === 'progress')
              list[2].Number++;
              else if (item.status === 'done')
              list[3].Number++;
              
              if (item.priority === 'Low Priority' && item.status !== 'done')
              list[4].Number++;
              else if (item.priority === 'Moderate Priority' && item.status !== 'done')
              list[5].Number++;
              else if (item.priority === 'High Priority' && item.status !== 'done')
              list[6].Number++;

              if (item.dueDate !== '' && item.status !== 'done')
              list[7].Number++;
          })

          res.status(200).send({ task: list });
      }
      else
          res.status(203).send({ task: list });

  } catch (error) {
    console.log(error)
      res.status(500).send(error);
  }
})

//Shared Task
router.get('/share/:taskid', async (req, res) => {
  try {
      const task = await Task.findOne({ _id: req.params.taskid });
      if (task) {
          res.status(200).send({ task: task });
      } else res.status(404).send({ message: 'No Task Found' });
  } catch (error) {
      res.status(500).send(error);
  }
})

//Exports
module.exports = router;
