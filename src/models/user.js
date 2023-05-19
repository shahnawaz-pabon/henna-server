const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    required: true,
  },
  timeSlots: [
    {
      time: {
        type: String,
        required: true,
      },
      isBooked: {
        type: Boolean,
        default: false,
      },
    },
  ],

  // day: {
  //   type: String,
  //   enum: [
  //     "Monday",
  //     "Tuesday",
  //     "Wednesday",
  //     "Thursday",
  //     "Friday",
  //     "Saturday",
  //     "Sunday",
  //   ],
  //   required: true,
  // },
  // startTime: {
  //   type: String,
  //   required: true,
  // },
  // endTime: {
  //   type: String,
  //   required: true,
  // },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "designer"],
      required: true,
      default: "customer",
    },
    address: {
      type: String,
    },
    territory: {
      type: String,
    },
    division: {
      type: String,
    },
    district: {
      type: String,
    },
    thana: {
      type: String,
    },
    schedule: {
      type: [scheduleSchema],
      required: true,
    },
    portfolio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Portfolio",
    },
    ratings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rating",
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
