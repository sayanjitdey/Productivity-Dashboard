const mongoose = require("mongoose");
const userModel = require("./user.model");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    status: {
      type: String,
      required: true,
      enum: ["todo", "in-progress", "done"],
      validator: function (value) {
        return this.enum.includes(value);
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
