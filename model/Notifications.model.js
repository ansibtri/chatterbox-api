const mongoose = require("mongoose");

const Notification = new mongoose.Schema({
  userId: ObjectId, // ID of the user who should receive the notification
  type: String, // Type of notification (e.g., 'message', 'mention')
  message: String, // Notification message (e.g., "You have a new message")
  roomId: ObjectId, // ID of the room related to the notification
  senderId: ObjectId, // ID of the user who triggered the notification
  isRead: Boolean, // Indicates if the notification has been read
  createdAt: Date, // Timestamp when the notification was created
});
