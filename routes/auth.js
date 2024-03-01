//imports
const express = require("express");
const router = express.Router();
const User = require("../models/auth.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyjwt = require("../middlewares/authMiddleware.js");

//Register API
router.post("/register", async (req, res) => {
  try {
    //getting data from request body
    const { name, email, password } = req.body;

    //validation
    if (!name || !email || !password) {
      return res.status(400).json({
        errorMessage: "Bad Request",
      });
    }

    //checking whether email already exists in the database and handling that case
    const doesAlreadyExist = await User.findOne({ email: email });

    if (doesAlreadyExist) {
      return res.status(409).json({
        errorMessage: "User Already Exists",
      });
    }

    //Adding data to my database
    const hashedPassword = await bcrypt.hash(password, 10); //hashing my password

    const userData = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    //token generation using jwt
    const token = await jwt.sign(
      { userId: userData._id },
      process.env.JWT_SECRET
    );

    // console.log(token);

    //sending JSON response
    res.status(200).json({
      name: userData.name,
      message: "User Registered Successfully",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Login API
router.post("/login", async (req, res) => {
  try {
    //getting data from request body
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
      return res.status(400).json({
        errorMessage: "Bad Request",
      });
    }

    //finding data from database on the basis of email
    const userDetails = await User.findOne({ email: email });

    //handling the case where details not present in database
    if (!userDetails) {
      return res.status(401).json({
        errorMessage: "Invalid Credentials !!!",
      });
    }

    //checking whether password match or not
    const doesPasswordMatch = await bcrypt.compare(
      password,
      userDetails.password
    );

    //case: password did not match
    if (!doesPasswordMatch) {
      return res.status(401).json({
        errorMessage: "Invalid Credentials",
      });
    }

    //case: password matched
    const token = await jwt.sign(
      { userId: userDetails._id },
      process.env.JWT_SECRET
    );

    //sending JSON response
    res.json({
      name: userDetails.name,
      message: "User Logged In Successfully",
      token: token,
    });
  } catch (error) {
    console.log(error);
  }
});

// <----------------- Settings ----------------->
router.put("/update", verifyjwt, async (req, res) => {
  try {
    const userExist = await User.findOne({
      _id: req.body.userId,
    });
    if (userExist) {
      if (req.body?.oldpassword !== "" && req.body?.newpassword !== "") {
        const verifiedPass = await bcrypt.compare(
          req.body.oldpassword,
          userExist.password
        );
        if (verifiedPass) {
          const hashedPassword = await bcrypt.hash(req.body.newpassword, 10);
          const obj = {
            name: req.body.name,
            password: hashedPassword,
          };
          if (req.body?.name !== "") {
            const result = await User.findOneAndUpdate(
              { _id: req.body.userId },
              { $set: obj },
              { new: true }
            );
            if (result)
              res
                .status(200)
                .send({
                  message: "Name and Password Updated",
                  name: result.name,
                });
            else res.status(400).send({ message: "Network Error" });
          } else {
            const result = await User.findOneAndUpdate(
              { _id: req.body.userId },
              { $set: { password: hashedPassword } }
            );
            if (result) res.status(200).send({ message: "Password Updated" });
            else res.status(400).send({ message: "Network Error" });
          }
        } else {
          res.status(400).send({ message: "Wrong Old Password" });
        }
      } else if (req.body?.name !== "") {
        const result = await User.findOneAndUpdate(
          { _id: req.body.userId },
          { $set: { name: req.body.name } },
          { new: true }
        );
        if (result)
          res.status(200).send({ message: "Name Updated", name: result.name });
        else res.status(400).send({ message: "Network Error" });
      } else res.status(400).send({ message: `All Fields can't be empty` });
    } else res.status(400).send({ message: "Network Error" });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

//Protected Routing
router.get("/protected", verifyjwt, async (req, res) => {
  res.status(200).send({ message: "Authorized User" });
});

//Exports
module.exports = router;
