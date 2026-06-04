const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    item_name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Laptop", "Monitor", "Keyboard", "Mouse", "Other"],
    },
    serial_number: { type: String, required: true, unique: true, trim: true },
    manufacturer: { type: String, required: true, trim: true },
    department: { type: String , required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["available", "checked_out"],
      default: "available",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Asset", assetSchema);
