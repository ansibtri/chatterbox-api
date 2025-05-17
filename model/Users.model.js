const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      minlength: 3, // Use minlength instead of min
      maxlength: 20, // Use maxlength instead of max
    },
    lastname: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    profilePic:{
      type:String,
      required:true,
    },
    dob:{
      type:Date,
      required:true
    },
    bio: {
      type: String,
      minlength: 3,
      maxlength: 100, // Added max length for bio
    },
    username: {
      type: String,
      unique:true,
      required: true,
      minlength: 3,
      maxlength: 20, // Added max length for username
    },
    email: {
      type: String,
      required: true,
      maxlength: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    country: {
      type: String,
      required: true,
      minlength: 3,
    },
    province: {
      type: String,
      required: true,
      minlength: 3,
    },
    contact: {
      type: String,
      required: true,
      unique: true,
    },
    gender:{
      type:String,
      required: true,
      default:"Male"
    },
    followers: {
      type: [Schema.Types.ObjectId],
      ref: "User", // Changed to singular "User" for consistency
      default: [],
    },
    following: {
      type: [Schema.Types.ObjectId],
      ref: "User", // Changed to singular "User" for consistency
      default: [],
    },
    socialMedia:{
      linkedIn:{type:String, default:""},
      portfolio:{type:String, default:""},
      github:{type:String, default:""},
      youtube:{type:String, default:""}
    },
    agreeToTerms: {
      type: Boolean,
      required: false,
    },
    savedPosts:{
      type:[Schema.Types.ObjectId],
      default:[],
      ref:"Posts"
    }
  },
  { timestamps: true }
);

module.exports = model("Users", UserSchema); // Changed model name to "User"

