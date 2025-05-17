const PostsRouter = require("express").Router();
const { response } = require("../utility/Response.utility");
const { uploadImage } = require("../utility/Upload.utility");
const Posts = require("../model/Posts.model");
const Users = require("../model/Users.model");
const Comments = require("../model/Comments.model");
const { logger } = require("../utility/Logger.utility");
const {Cache} = require("../utility/Cache.utility")
const Mongoose= require("mongoose");

PostsRouter.post("/create", uploadImage.array("images"), async (req, res) => {
  try {
    const postImagesArray = req.files.map((file) => ({
      filename: file.filename,
      path: file.path,
      destination: file.destination,
    }));

    // destructure the request body to get the required fields
    const {
      postedBy,
      description,
      location,
      tagged=[],
      music,
      postedAt,
      likedBy,
    } = req.body;

    // Ensure `tagged` is an array of valid ObjectIds
    const validTagged = Array.isArray(tagged)
      ? tagged.filter((id) => id && id.trim() !== "") // Remove empty strings
      : [];
    // save the post
    const post = new Posts({
      postedBy: postedBy,
      postedAt: postedAt || Date.now(),
      images: postImagesArray,
      description,
      location,
      tagged:validTagged,
      music,
      likedBy: [],
    });

    const savedPost = await post.save();

    // check if the post is saved successfully
    if (!savedPost) {
      return response(res, 400, "error", { message: "Post not saved" });
    }
    // return the response

    return response(res, 200, "success", {
      message: "Post created successfully",
      data: savedPost,
    });
  } catch (error) {
    return response(res, 400, "error", { message: error.message });
  }
});

// get all posts
PostsRouter.get("/", async (req, res) => {
  try {
    // get all documents
    const allPosts = await Posts.find({}).sort({postedAt:-1}).populate("postedBy").exec();
    
    return response(res, 200, "success", {
      message: "Posts Fetched Successfull",
      data: allPosts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});




// get posts counts by userId
PostsRouter.get("/counts", async(req,res)=>{
  try{
    const {userId} = req.body;
    const postCounts = await Posts.where({postedBy:userId}).countDocuments();
    
    return res.status(500).json({
      success: true,
      message: "Posts Counts Fetched Successfully!!!",
      data:postCounts
    });
  }catch(error){
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
})

// get posts counts by userId
PostsRouter.get("/:userId", async(req,res)=>{
  try{
    // get userId as parameters
    const {userId} = req.params
    // fetch user from database
    const postOfUser = await Posts.where({postedBy:userId}).sort({postedAt:-1}).exec();
    return res.status(200).json({
      success: true,
      message: "Posts Counts Fetched Successfully!!!",
      data:postOfUser
    });
  }catch(error){
    logger("error", error.message)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
})

// get posts and userdata by username
PostsRouter.get("/userpost/:username",async(req,res)=>{
  try{
    // get userId as parameters
    const {username} = req.params
    //fetch username
    const user = await Users.findOne({username:username}).exec();
    const userId = user._id;
    // fetch user from database
    const postOfUser = await Posts.where({postedBy:userId}).sort({postedAt:-1}).exec();
    
    return res.status(200).json({
      success: true,
      message: "User and Posts Fetched Successfully!!!",
      data:{user,postOfUser}
    });
  }catch(error){
    logger("error", error.message)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
})


// react(like/unlike_ a post
PostsRouter.put("/react/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    // check if the post exists
    const post = await Posts.findById(postId);
    if (!post) {
      return response(res, 404, "error", { message: "Post not found" });
    }

    console.log(post)

    const likedByArray = post.likedBy.map((id) => id.toString());
    console.log(likedByArray)
    // check if the user has already liked the post
    if (likedByArray.includes(userId.toString())) {
      // unlike the post
      post.likedBy = post.likedBy.filter((id) => {
        if(id.toString() !== userId){
          return  new Mongoose.Types.ObjectId(id);
        }
      });
      // save the post
      await post.save();
      return response(res, 200, "success", {
        message: "Post unliked successfully",
        data: post,
      });
    } else {
      console.log("userId",userId)
      // like the post
      post.likedBy.push( new Mongoose.Types.ObjectId(userId));
      // save the post
      await post.save();
      return response(res, 200, "success", {
        message: "Post liked successfully",
        data: post,
      });
    }


  } catch (error) {
    console.log(error)
    return response(res, 400, "error", { message: error.message });
  }
});

// get savedPost
PostsRouter.get("/savedposts/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // check if the post exists
    const user = await Users.findById(userId).exec();

    if (!user) {
      return response(res, 404, "error", { message: "User not found" });
    }
    
    const savedPostsArray = user.savedPosts.map((id) => id.toString());
    
    // fetch saved posts from database
    const savedPosts = await Posts.find({ _id: { $in: savedPostsArray } }).populate("postedBy","firstname lastname username profilePic _id").exec();
    if (!savedPosts) {
      return response(res, 404, "error", { message: "Saved posts not found" });
    }

    // return the response
    return response(res, 200, "success", {
      message: "Saved Posts Fetched Successfully",
      data: savedPosts,
    });
  } catch (error) {
    console.log(error)
    return response(res, 400, "error", { message: error.message });
  }
})

// delete all posts
PostsRouter.delete("/deleteall", async (req, res) => {
  const delet = await Posts.deleteMany();
  return res.status(200).json(delet);
});
module.exports = PostsRouter;

// PostsRouter.post("/", verifyToken, createPost);
// PostsRouter.put("/:id", verifyToken, updatePost);
// PostsRouter.delete("/:id", verifyToken, deletePost);

// PostsRouter.get("/search", verifyToken, getPosts); // For searching posts
// PostsRouter.get("/:id", verifyToken, getPosts); // For getting a single post

// PostsRouter.get("/user/:id", verifyToken, getPosts); // For getting posts by user id
// PostsRouter.get("/tag/:tag", verifyToken, getPosts); // For getting posts by tag

// PostsRouter.get("/category/:category", verifyToken, getPosts); // For getting posts by category
// PostsRouter.get("/date/:date", verifyToken, getPosts); // For getting posts by date

// PostsRouter.get("/author/:author", verifyToken, getPosts); // For getting posts by author
// PostsRouter.get("/comment/:comment", verifyToken, getPosts); // For getting posts by comment

// PostsRouter.get("/like/:like", verifyToken, getPosts); // For getting posts by like
// PostsRouter.get("/dislike/:dislike", verifyToken, getPosts); // For getting posts by dislike

// PostsRouter.get("/share/:share", verifyToken, getPosts); // For getting posts by share
// PostsRouter.get("/save/:save", verifyToken, getPosts); // For getting posts by save

// PostsRouter.get("/report/:report", verifyToken, getPosts); // For getting posts by report
// PostsRouter.get("/flag/:flag", verifyToken, getPosts); // For getting posts by flag
// PostsRouter.get("/block/:block", verifyToken, getPosts); // For getting posts by block
// PostsRouter.get("/mute/:mute", verifyToken, getPosts); // For getting posts by mute
// PostsRouter.get("/unmute/:unmute", verifyToken, getPosts); // For getting posts by unmute
// PostsRouter.get("/unblock/:unblock", verifyToken, getPosts); // For getting posts by unblock

// PostsRouter.get("/unflag/:unflag", verifyToken, getPosts); // For getting posts by unflag
// PostsRouter.get("/unreport/:unreport", verifyToken, getPosts); // For getting posts by unreport

// PostsRouter.get("/unlike/:unlike", verifyToken, getPosts); // For getting posts by unlike
// PostsRouter.get("/undislike/:undislike", verifyToken, getPosts); // For getting posts by undislike

// PostsRouter.get("/unshare/:unshare", verifyToken, getPosts); // For getting posts by unshare
// PostsRouter.get("/unsave/:unsave", verifyToken, getPosts); // For getting posts by unsave

// PostsRouter.get("/uncomment/:uncomment", verifyToken, getPosts); // For getting posts by uncomment
