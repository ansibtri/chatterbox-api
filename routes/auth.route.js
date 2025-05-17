const AuthRouter = require("express").Router();
exports.AuthRouter = AuthRouter;
const Users = require("../model/Users.model");
const { response } = require("../utility/Response.utility");
const bcrypt = require("bcryptjs");
const { logger } = require("../utility/Logger.utility");
const { setCookie } = require("../utility/Cookie.utility");
const { generateJWT, verifyJWT } = require("../utility/AuthJWT.utility");
const jwt = require("jsonwebtoken");
// registering account
AuthRouter.post("/register", async (req, res) => {
  try {
    // check if any variable is empty
    if (
      req.body.email == "" ||
      req.body.firstname == "" ||
      req.body.lastname == "" ||
      req.body.password == "" ||
      req.body.country == "" ||
      req.body.contact == "" ||
      req.body.province == ""
    ) {
      // response back with warning if variable is empty
      return response(res, 199, "warning", "Field can't be empty");
    }

    // get email and password
    const { email, password, contact, ..._ } = req.body;
    // check email in database if it exists
    const user = await Users.findOne({ email: email });

    // if email exists send a response
    if (user?.email === email) {
      return response(res, 200, "warning", {
        message: "Email Already Exists!!!",
      });
    }

    // if phone number already exists
    if(user?.contact === contact){
      return response(res, 200, "warning", {
        message: "Contact Number Already Exists!!!",
      });
    }



    // Create new account
    const salt = await bcrypt.genSalt(10); // generate salt

    const createNewUser = new Users({
      email: email,
      username: Date.now(),
      password: await bcrypt.hash(password, salt),
      ..._,
    });
    // save the new user
    const savedNewUser = await createNewUser.save();
    // send response back to client
    return response(res, 200, "success", {
      message: "Account Created Successfully!!!",
      user: savedNewUser,
    });
  } catch (error) {
    // log the error
    logger("error", error.message, error.name);
    // return unsuccess response
    return response(res, 400, "error", { message: error?._message });
  }
});

// login account
AuthRouter.post("/login", async (req, res) => {
  try {
    // destructuring
    const { email, password, gender } = req.body;
    // check if email exists
    if (email == "" || password == "")
      return response(res, 401, "warning", {
        message: "Credentials is missing",
      });

    const user = await Users.findOne({ email: email });
    
    if (!user?.email)
      return response(res, 401, "warning", { message: "Invalid Credentials" });

    const validPassword = await bcrypt.compare(password, user?.password);
    if (!validPassword)
      return response(res, 401, "warning", { message: "Invalid Credentials" });

    const data ={
      contact: user?.contact,
      country: user?.country,
      email: user?.email,
      firstname: user?.firstname,
      lastname: user?.lastname,
      province: user?.province,
      username: user?.username,
      followers: user?.followers,
      following: user?.following,
      profilePic:user?.profilePic,
      socialMedia:user?.socialMedia,
      bio: user?.bio,
      id: user?._id,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
    }
    // generate JSON Web Token
    const token = generateJWT(data);
    // set cookie
    setCookie(res, "authToken", token);

    // response back
    return response(res, 200, "success", {
      message: "Logged In!!!",
      token: generateJWT(user),
      data,
    });
  } catch (error) {
    logger("error", error._message);
    
    return response(res, 400, "Failed", error?._message);
  }
});

// logout account
AuthRouter.post("/logout", async (req, res) => {
  try {
    // clear cookies
    res.clearCookie("authToken");
    return response(res, 200, "success", { message: "Logged Out" });
  } catch (error) {
    console.log(error);
  }
});
// Delete all accounts
AuthRouter.delete("/deleteall", async (req, res) => {
  const delet = await Users.deleteMany();
  return res.status(200).json(delet);
});

// check cookie validates or not
AuthRouter.post("/cookie", (req, res) => {
  try {
    const { authToken } = req.cookies;
    
    if (authToken) {
      const token = jwt.verify(authToken, process.env.TOKEN_KEY);
      return res
        .status(200)
        .json({
          user: token.data || null,
          isAuthenticated: true,
          authToken: authToken || null,
        });
    } else {
      return res
        .clearCookie("authToken")
        .status(200)
        .json({ isAuthenticated: false, authToken: null, user: null });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .clearCookie("authToken")
        .status(200)
        .json({ isAuthenticated: false, authToken: null, user: null });
    }
    if (error.name === "JsonWebTokenError") {
      return res
        .status(200)
        .json({ isAuthenticated: false, authToken: null, user: null });
    }
    if (error.name === "NotBeforeError") {
      return res
        .status(200)
        .json({ isAuthenticated: false, authToken: null, user: null });
    }
    if (error.name === "SyntaxError") {
      return res
        .status(200)
        .json({ isAuthenticated: false, authToken: null, user: null });
    }
    return res.status(400).json({ type: error.name, message: error.message });
  }
});

module.exports = AuthRouter;
