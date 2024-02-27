const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    images: {
      type: Array,
    },
    description: {
      type: String,
    },
  }, { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);