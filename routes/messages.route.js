const MessagesRouter = require("express").Router();
const Rooms = require("../model/Rooms.model");
const Messages = require("../model/Messages.model");
const { response } = require("../utility/Response.utility");
var ObjectId = require("mongodb").ObjectId;
// create a message in a room
MessagesRouter.post("/create", async (req, res) => {
  try {
    console.log("req body",req.body)
    const { roomId, senderId, content, image } = req.body;

    if(!roomId || !senderId || !content){
      return response(res, 500, "error", {
        message: "Empty Field"
      });
    }
    // check if room exists
    const messages = new Messages({
      roomId: new ObjectId(roomId.trim()),
      senderId: new ObjectId(senderId?._id),
      content,
      image
    });
    // save the  message in database
    const saveMessage = await messages.save();
    console.log(saveMessage)
    // return the response
    return response(res, 200, "success", {
      message: "Message Sent Successfully!!!",
      data: saveMessage,
    });
  } catch (error) {
    return response(res, 500, "error",{ message:"Error Occurred!!!", data: error._message });
  }
});

// get messages of a room
MessagesRouter.get("/:roomId/texts", async (req, res) => {
  try {
    // get room Id
    const { roomId } = req.params;

    // check if room exists
    const messages = await Messages.find({ roomId })
      .sort({ createdAt: -1 })
      .populate([
        { path: "roomId", select: "_id members isGroup name groupImage" },
        {
          path: "senderId",
          select: "_id firstname lastname profilePic username",
        },
      ]);
      
    return response(res, 200, "success", {
      message: "Messages Fetched Successfully!!!",
      messages,
    });
  } catch (error) {
    return response(res, 500, "error", { message: error.message });
  }
});

MessagesRouter.delete("/all",async(req,res)=>{
  const messages = await Messages.deleteMany({});
  return res.json(messages)
})

module.exports = MessagesRouter;
