const CommentsRouter = require('express').Router();
const Comments = require('../model/Comments.model');
const {response } = require('../utility/Response.utility');
const Posts = require('../model/Posts.model');
const Users = require('../model/Users.model');
const Mongoose = require('mongoose');

// create a comment
CommentsRouter.post('/create', async(req,res)=>{

      try{
            // destructure req.body to get postId, author, and content
            const {postId, author, content}= req.body;
            // check if postId, author, and content are provided
            if(!postId || !author || !content){
                  return response(res, 400, "error", {message: "Please provide all required fields"});
            }


            // create a new comment
            const newComment = new Comments({
                  postId: new Mongoose.Types.ObjectId(postId),
                  author: new Mongoose.Types.ObjectId(author),
                  content
            });

            // save the comment to the database
            const savedComment = await newComment.save();


            // return success response
            return response(res, 200, "success", {
                  message: "Commented!!!",
                  data: savedComment
            });

      }catch(error){
            console.log(error);
            return response(res, 500, "error", {message: error._message});
      }
      
})
// get all comments for a post
CommentsRouter.get("/post/:postId", async(req,res)=>{
      try{
            // get postId from req.params
            const {postId} = req.params;

            // check if postId is provided
            if(!postId){
                  return response(res, 400, "error", {message: "Please provide postId"});
            }
            // get all comments for the post
            const comments = await Comments.find({postId}).populate('author', 'name username profilePic').exec();

            // return success response
            return response(res, 200, "success", {
                  message: "Comments fetched successfully",
                  data: comments
            });
      }catch(error){
            console.log(error);
            return response(res, 500, "error", {message: error._message});
      }
})
// like and unlike a comment
CommentsRouter.put("/:commentId/like", async(req,res)=>{
      try{
            // get commentId from req.params
            const {commentId} = req.params;
            const {userId} = req.body;

            // check if commentId and userId are provided
            if(!commentId || !userId){
                  return response(res, 400, "error", {message: "Please provide all required fields"});
            }

            // check if the comment exists
            const comment = await Comments.findById(commentId);
            if(!comment){
                  return response(res, 404, "error", {message: "Comment not found"});
            }

            // check if the user has already liked the comment
            const likesArray = comment.likes.map((id) => id.toString());
            
            if(likesArray.includes(userId)){
                  // unlike the comment
                  comment.likes = comment.likes.filter((id) => id.toString() !== userId);
                  await comment.save();
                  return response(res, 200, "success", {
                        message: "Comment unliked successfully",
                        data: comment
                  });
            }else{
                  // like the comment
                  comment.likes.push(new Mongoose.Types.ObjectId(userId));
                  await comment.save();
                  return response(res, 200, "success", {
                        message: "Comment liked successfully",
                        data: comment
                  });
            }
      }catch(error){
            console.log(error);
            return response(res, 500, "error", {message: error._message});
      }
})
// delete a comment
CommentsRouter.delete("/:commentId", async(req,res)=>{
      try{
            // get commentId from req.params
            const {commentId} = req.params;

            // check if commentId is provided
            if(!commentId){
                  return response(res, 400, "error", {message: "Please provide commentId"});
            }

            // check if the comment exists
            const comment = await Comments.findById(commentId);
            if(!comment){
                  return response(res, 404, "error", {message: "Comment not found"});
            }

            // delete the comment
            await Comments.findByIdAndDelete(commentId);

            // return success response
            return response(res, 200, "success", {
                  message: "Comment deleted successfully"
            });
      }catch(error){
            console.log(error);
            return response(res, 500, "error", {message: error._message});
      }
});
// reply to a comment
CommentsRouter.post("/:commentId/reply", async(req,res)=>{
      try{

            const {commentId} = req.params;
            const {author, content} = req.body;

            // check if commentId, author, and content are provided
            if(!commentId || !author || !content){
                  return response(res, 400, "error", {message: "Please provide all required fields"});
            }

            // check if the comment exists
            const comment = await Comments.findById(commentId);
            if(!comment){
                  return response(res, 404, "error", {message: "Comment not found"});
            }

            // create a new reply
            const newReply = {
                  author: new Mongoose.Types.ObjectId(author),
                  content,
                  createdAt: Date.now()
            };

            // add the reply to the comment
            comment.replies.push(newReply);

            const savedCommentReply = await comment.save();
            
            // return success response
            return response(res, 200, "success", {
                  message: "Reply added successfully",
                  data: savedCommentReply
            });


      }catch(error){
            console.log(error);
            return response(res, 500, "error", {message: error._message});
      }
})
// get all replies for a comment
CommentsRouter.get("/:commentId/replies", async(req,res)=>{
      try{
            // get commentId from req.params
            const {commentId} = req.params;

            // check if commentId is provided
            if(!commentId){
                  return response(res, 400, "error", {message: "Please provide commentId"});
            }

            // check if the comment exists
            const comment = await Comments.findById(commentId).populate('replies.author', 'name username profilePic').exec();
            if(!comment){
                  return response(res, 404, "error", {message: "Comment not found"});
            }

            // return success response
            return response(res, 200, "success", {
                  message: "Replies fetched successfully",
                  data: comment.replies
            });
      }catch(error){
            console.log(error);
            return response(res, 500, "error", {message: error._message});
      }
})
// delete a reply
CommentsRouter.delete("/:commentId/reply/:replyId", async(req,res)=>{
      try{
            // get commentId and replyId from req.params
            const {commentId, replyId} = req.params;

            // check if commentId and replyId are provided
            if(!commentId || !replyId){
                  return response(res, 400, "error", {message: "Please provide all required fields"});
            }

            // check if the comment exists
            const comment = await Comments.findById(commentId);
            if(!comment){
                  return response(res, 404, "error", {message: "Comment not found"});
            }

            // check if the reply exists
            const reply = comment.replies.id(replyId);
            if(!reply){
                  return response(res, 404, "error", {message: "Reply not found"});
            }

            // delete the reply
            reply.remove();
            await comment.save();

            // return success response
            return response(res, 200, "success", {
                  message: "Reply deleted successfully"
            });
      }catch(error){
            console.log(error);
            return response(res, 500, "error", {message: error._message});
      }
}
)
// update a comment
CommentsRouter.put("/:commentId", async(req,res)=>{
      try{
            // get commentId from req.params
            const {commentId} = req.params;
            const {content} = req.body;

            // check if commentId and content are provided
            if(!commentId || !content){
                  return response(res, 400, "error", {message: "Please provide all required fields"});
            }

            // check if the comment exists
            const comment = await Comments.findById(commentId);
            if(!comment){
                  return response(res, 404, "error", {message: "Comment not found"});
            }

            // update the comment content
            comment.content = content;
            await comment.save();

            // return success response
            return response(res, 200, "success", {
                  message: "Comment updated successfully",
                  data: comment
            });
      }catch(error){
            console.log(error);
            return response(res, 500, "error", {message: error._message});
      }
}
)
// update a reply
CommentsRouter.patch("/reply",async(req,res)=>{
      try{
            // get commentId and replyId from req.params
            const {commentId, replyId} = req.params;
            const {content} = req.body;

            // check if commentId and replyId are provided
            if(!commentId || !replyId || !content){
                  return response(res, 400, "error", {message: "Please provide all required fields"});
            }

            // check if the comment exists
            const comment = await Comments.findById(commentId);
            if(!comment){
                  return response(res, 404, "error", {message: "Comment not found"});
            }

            // check if the reply exists

            const reply = comment.replies.id(replyId);
            if(!reply){
                  return response(res, 404, "error", {message: "Reply not found"});
            }

            // update the reply content
            reply.content = content;
            await comment.save();

            // return success response
            return response(res, 200, "success", {
                  message: "Reply updated successfully",
                  data: comment.replies
            });

      }catch(error){
            console.log(error);
            return response(res, 500, "error", {message: error._message});
      }
})

// delete all comments
CommentsRouter.delete('/deleteallcomments', async(req,res)=>{
      try{
            const deletedComments = await Comments.deleteMany();
            return res.json(deletedComments).status(200)
      }catch(error){
            console.log(error)
      }
})

module.exports = CommentsRouter;