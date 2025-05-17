const RoomsRouter = require("express").Router();
const Rooms = require("../model/Rooms.model");
const Users = require("../model/Users.model");
const { response } = require("../utility/Response.utility");
// create room
RoomsRouter.post("/", async (req, res) => {});

// get all rooms of the logged user involved.
RoomsRouter.get("/:currentUserId/chatlist", async (req, res) => {
  try {
    // get all rooms of the logged user involved.
    const { currentUserId } = req.params;

    // get rooms where current user is present
    const rooms = await Rooms.find({ members: { $in: currentUserId } });

    // enriched rooms
    const enrichedRooms = await Promise.all(
      rooms.map(async (room) => {
        // get friend's id by excluding current id
        if (room.isGroup != true && room.members.length == 2) {
          // filter id and remove current user id
          const friendId = room.members.find(
            (id) => id.toString() !== currentUserId
          );

          //     if returns null then return nulls
          if (!friendId) return null;

          //     get friend details by friendId
          const friend = await Users.findById(friendId)
            .select("_id firstname lastname username profilePic")
            .exec();

          // if there is no data of friend then return null
          if (!friend) return null;

          //     return rooms list
          return {
            lastMessage: room?.lastMessage,
            roomId: room?._id,
            members: room?.members,
            isGroup: room?.isGroup,
            name: friend?.firstname + " " + friend?.lastname,
            groupImage: friend?.profilePic,
            username: friend?.username,
          };
        }
      })
    );

    return response(res, 200, "success", {
      message: "Rooms Fetched Successfully!!!",
      rooms: enrichedRooms.filter(Boolean), // remove nulls
    });
  } catch (error) {
    console.log(error);
  }
});

// delete room
RoomsRouter.delete("/", async (req, res) => {});

// update rooms last message
RoomsRouter.patch("/:roomId/lastmessage", async (req, res) => {
  try{
    // destructure req
    const { message, senderId} = req.body;
    // get params
    const {roomId} = req.params;

    // check if empty 
    if (!message || !senderId){
      return response(res, 500,"error",{message:"Something Error Occurred!!! hhh"});
    }

    // get room
    const room = await Rooms.findById(roomId);

    // update value 
    room.lastMessage = message;

    const updatedRoom = await room.save();

    console.log(updatedRoom);


    return response(res, 200,"success",{message:"Updated Last message!!!", data:updatedRoom});
    
  }catch(error){
    console.log(error)
    return response(res, 500,"error",{message:"Something Error Occurred!!!"});
  }
});

module.exports = RoomsRouter;
