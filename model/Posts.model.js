const { Schema, model } = require("mongoose");

const Posts = new Schema({
  postedBy: { type: Schema.Types.ObjectId, required: true, ref: "Users" },
  postedAt: {
    type: Date,
    default: Date.now,
  },
  images: {
    type: [Object],
    default: [],
  },
  description: {
    type: String,
    minlength: 0,
  },
  location: {
    type: String,
  },
  tagged: {
    type: [Schema.Types.ObjectId],
    ref: "Users",
    default: [],
    validate: {
      validator: function (value) {
        // Ensure all elements in the array are valid ObjectIds
        return value.every((id) => mongoose.Types.ObjectId.isValid(id));
      },
      message: "All tagged users must be valid ObjectIds.",
    },
  },
  music: {
    type: String,
    default: undefined,
  },
  likedBy: {
    type: [Schema.Types.ObjectId],
    ref: "Users",
    default: [],
  },
});

module.exports = model("Posts", Posts);
