//Imports
const jwt = require("jsonwebtoken");

//middleware function to verify the jwt token
const verifyjwt = (req, res, next) => {
  try {
    //looking for my jwt token in request header
    const authorizationHeader = req.headers.authorization;
    const secret = process.env.JWT_SECRET;

    console.log(authorizationHeader);

    //case: token not found
    if (!authorizationHeader) {
      return res.status(401).json({
        errorMessage: "Unauthorized User",
      });
    }

    //getting token from authorization header
    const [, token] = authorizationHeader.split(' ');

    // console.log(token);
    // console.log(process.env.JWT_SECRET);
    // console.log(typeof process.env.JWT_SECRET);
    //decoding the token
    
    const decoded = jwt.verify(token, secret);

    // console.log(decoded);

    //case: token couldn't be decoded successfully
    if (!decoded) {
      return res.status(401).json({
        errorMessage: "Unauthorized User",
      });
    }

    //storing userId in request body
    req.body.userId = decoded.userId;

    //case: token decoded successfully
    next();
  } catch (error) {
    // res.status(401).json({
    //   errorMessage: "Invalid token",
    // });
    console.log(error);
  }
};

module.exports = verifyjwt;
