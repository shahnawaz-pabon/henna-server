const express = require("express");
const router = express.Router();
const { getDayOfWeek } = require("../utils/helpers");

const { User, Appointment } = require("../config/db");

// Create an appointment
router.post("/save", async (req, res) => {
  const { customerId, designerId, date, time, address, phone } = req.body;

  try {
    // Find the customer and designer by their IDs
    const customer = await User.findById(customerId);
    const designer = await User.findById(designerId);

    if (!customer || !designer) {
      return res.status(404).json({ error: "User not found" });
    }

    // Convert the date string to a JavaScript Date object
    const appointmentDate = new Date(date);

    // Get the string representation of the day of the week
    const dayOfWeek = getDayOfWeek(appointmentDate.getDay());

    // Check if the designer is available on the given date and time
    const daySchedule = designer.schedule.find(
      (schedule) => schedule.dayOfWeek === dayOfWeek
    );

    // console.log("appointmentDate.getDay()");
    // console.log(dayOfWeek);
    // console.log(appointmentDate);
    // console.log(daySchedule);

    if (!daySchedule) {
      return res.status(400).json({ error: "Invalid day of the week" });
    }

    const timeSlot = daySchedule.timeSlots.find((slot) => slot.time == time);

    if (!timeSlot || timeSlot.isBooked) {
      return res.status(400).json({ error: "Time slot is not available" });
    }

    // Create the appointment
    const appointment = new Appointment({
      customer: customerId,
      designer: designerId,
      date: appointmentDate,
      time,
      status: "booked",
      address: address,
      phone: phone,
    });

    // Update the isBooked status in the schedule
    timeSlot.isBooked = true;

    // Save the updated schedule and the appointment
    await designer.save();
    await appointment.save();

    return res
      .status(200)
      .json({ message: "Appointment created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// Get appointments for a user
router.get("/list-by-user/:id", async (req, res) => {
  const userId = req.params.id;
  const userRole = req.query.role;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    var appointments;

    // Find the appointments for the user
    if (userRole == "customer") {
      appointments = await Appointment.find({ customer: userId })
        .populate("customer", "name avatar role")
        .populate("designer", "name avatar role")
        .exec();
    } else {
      appointments = await Appointment.find({ designer: userId })
        .populate("customer", "name avatar role")
        .populate("designer", "name avatar role")
        .exec();
    }

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
