const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    adminStatus: {
        type: Boolean,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        default: "",
    },
    profilePicture: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    followers: {
        type: Array,
        default: [],
    },
    following: {
        type: Array,
        default: [],
    },
  }, { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);