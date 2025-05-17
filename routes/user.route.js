// this router only handles single user request
// Alternatively, we can say the user who is logged in.
const UserRouter = require("express").Router();
const Users = require("../model/Users.model");
const Rooms = require("../model/Rooms.model")
const { response } = require("../utility/Response.utility");
const Mongoose = require("mongoose");
const Posts = require("../model/Posts.model");

// search user by username text
UserRouter.get("/search", async (req, res) => {
  try {
    // get params
    const { username } = req.query;
    
    // find a username in the database
    const usernameExists = await Users.find({
      username: { $regex: new RegExp(username, "i") },
    })
      .select(
        "firstname lastname profilePic username followers following socialMedia"
      )
      .exec();
    // if it returns null send response as warning
    if (!usernameExists)
      return response(res, 200, "warning", {
        message: "Username Not Found!!!",
      });
    // if username exists in the database destructing password with other elements
    // and send data excepts password.
    // const {password, createdAt, updatedAt,..._} = usernameExists?._doc;
    return response(res, 200, "success", { users: usernameExists });
  } catch (error) {
    console.log(error);
  }
});

// get user by unique
UserRouter.get("/:username", async (req, res) => {
  try {
    // get params
    const { username } = req.params;
    // find a username in the database
    const usernameExists = await Users.findOne({ username: username });
    
    // if it returns null send response as warning
    if (!usernameExists)
      return response(res, 200, "warning", {
        message: "Username Not Found!!!",
      });
    // if username exists in the database destructing password with other elements
    // and send data excepts password.
    const { password, createdAt, updatedAt, ..._ } = usernameExists?._doc;
    return response(res, 200, "success", { user: _ });
  } catch (error) {
    console.log(error);
  }
});

// follow user

UserRouter.patch("/follow", async (req, res) => {
  try {
    const { targetUserId, currentUserId } = req.body;

    const targetUser = await Users.findById(targetUserId);
    const currentUser = await Users.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return response(res, 200, "error", "User not found");
    }

    const isFollowing = currentUser.following.includes(targetUserId);
    
    if (isFollowing) {
      // for unfollowing
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
      await currentUser.save();
      await targetUser.save();

      return response(res, 200, "success", {
        message: "Unfollowed Successfully!!!",
      });
    } else {
      // for following
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      await currentUser.save();
      await targetUser.save();

      // Check for Mutual follow
      const isMutual = targetUser.following.includes(currentUserId);
      
      if(isMutual){
        // check if room already exists
        const existingRoom = await Rooms.findOne({
          members:{$all:[currentUserId, targetUserId], $size:2}
        })

        if(!existingRoom){
          const x = await Rooms.create({members:[currentUserId, targetUserId]});
          console.log(x)
        }
        console.log(existingRoom)
      }

      return response(res, 200, "success", {
        message: "Followed Successfully!!!",
      });
    }
  } catch (error) {
    console.log(error);
  }
});


// get users whose birthday is on current day
UserRouter.get("/birthday", async (req, res) => {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // Months are zero-based

    const usersWithBirthdayToday = await Users.find({
      $expr: {
        $and: [
          { $eq: [{ $dayOfMonth: "$dob" }, day] },
          { $eq: [{ $month: "$dob" }, month] },
        ],
      },
    }).select("firstname lastname profilePic username dob").exec();

    return response(res, 200, "success", {
      message: "Users with Birthday Today Fetched Successfully!!!",
      data: usersWithBirthdayToday,
    });
  } catch (error) {
    console.log(error);
  }
});



// save posts
UserRouter.put("/:userId/savepost", async (req,res)=>{
  try {
    const { postId } = req.body;
    const { userId } = req.params;

    // check if the post exists
    const user = await Users.findById(userId);
    if (!user) {
      return response(res, 404, "error", { message: "User not found" });
    }


    const savedPostsArray = user.savedPosts.map((id) => id.toString());
    
    // check if the user has already liked the post
    if (savedPostsArray.includes(postId.toString())) {
      // unlike the post
      user.savedPosts = user.savedPosts.filter((id) => {
        if(id.toString() !== postId){
          return  new Mongoose.Types.ObjectId(id);
        }
      });
      // save the post
      await user.save();
      return response(res, 200, "success", {
        message: "Post unsaved successfully",
        data: user,
      });
    } else {
      // like the post
      user.savedPosts.push( new Mongoose.Types.ObjectId(postId));
      // save the post
      await user.save();
      return response(res, 200, "success", {
        message: "Post saved successfully",
        data: user,
      });
    }


  } catch (error) {
    console.log(error)
    return response(res, 400, "error", { message: error.message });
  }
});
module.exports = UserRouter;
