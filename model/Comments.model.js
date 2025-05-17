const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Posts", // Replace with your actual Post model
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Users", // Reference to user who commented
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
    replies: {
      type: [
        {
          author: {
            type: Schema.Types.ObjectId,
            ref: "Users",
          },
          content: {
            type: String,
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: "Users",
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Comments", commentSchema);
