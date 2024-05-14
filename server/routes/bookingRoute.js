const express = require("express");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const Booking = require("../models/booking");
const Room = require("../models/room");

router.post("/getallbookings", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.send(bookings);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error });
  }
});

// Define the '/bookroom' route handler
router.post("/bookroom", async (req, res) => {
  console.log("Gi");
  try {
    const {
      roomid,
      userid,
      fromdate,
      todate,
      totalamount,
      totaldays,
      transactionid,
      room,
    } = req.body;
    // Create a new booking
    const newBooking = new Booking({
      roomid,
      userid,
      fromdate,
      todate,
      totalamount,
      totaldays,
      transactionid,
      room,
    });
    // Save the booking to the database
    const booking = await newBooking.save();

    // Optionally, you can update the room's current bookings if needed
    // For simplicity, I'm omitting this step in this example

    res.send("Booking successful!");
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "Error occurred while booking the room" });
  }
});

router.post("/cancelbooking", async (req, res) => {
  const { bookingid, roomid } = req.body;
  try {
    const booking = await Booking.findOne({ _id: bookingid });

    booking.status = "cancelled";
    await booking.save();
    const room = await Room.findOne({ _id: roomid });
    const bookings = room.currentbookings;
    const temp = bookings.filter((x) => x.bookingid.toString() !== bookingid);
    room.currentbookings = temp;
    await room.save();
    res.send("Your booking cancelled successfully");
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error });
  }
});

router.post("/getbookingbyuserid", async (req, res) => {
  const { userid } = req.body;
  try {
    const bookings = await Booking.find({ userid: userid });

    res.send(bookings);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error });
  }
});

module.exports = router;
