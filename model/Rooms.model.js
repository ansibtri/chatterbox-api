const { Schema, model } = require("mongoose");

const Room = new Schema({
  members:[{type:Schema.Types.ObjectId, ref:"Users"}],
  isGroup:{
    type:Boolean,
    default:false,
  },
  name:{
    type:String,
    default:"",
  },
  groupImage:{
    type:String,
    default:null
  },
  lastMessage:{
    type:String,
    senderId:{type:Schema.Types.ObjectId,ref:"Users"},
    default:"",
  },
  createdBy:{
    type:Schema.Types.ObjectId,
    ref:"Users"
  }
},{ timestamps: true });

module.exports = model('Rooms', Room)