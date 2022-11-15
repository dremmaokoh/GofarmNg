const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    description: {
      type: String,
      required: [true, "Please enter a valid description"],
    },
    isAvailable: {
      type: Number,
      min: 0,
    },
    productPicture: {
      type: String,
      required: [true, "please enter a valid image"],
    },
    cost: {
      type: Number,
      required: [true, "Please fill in the cost"],
    },

    category: {
      type: String,
      enum: ["cereals", "fruits", "bakery","dairy","spices","beverages","seafoods","tubers","meat","juices","vegetables","others"],
      required: [true, "Please fill in the category"],
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    capped: {
      size: 1024 * 1024 * 1024, // 1GB Maximum size
      autoIndexId: true,
    },
    timestamps: true,
  }
);
module.exports = mongoose.model("Product", farmSchema );
