const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rooms",
      required: true, // Fixed typo from "require" to "required"
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId, // Fixed type definition
      required: true,
      ref:'Users'
    },
    content: {
      type: String,
      required: true,
    },
    readBy: {
      type: [mongoose.Schema.Types.ObjectId], // Fixed ObjectId reference
      default: [],
    },
    metadata: {
      fileUrl: { type: String, default:"" },
      fileSize: { type: Number, default:"" },
      imageWidth: { type: Number, default:"" },
      imageHeight: { type: Number, default:"" },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Messages", MessageSchema);
