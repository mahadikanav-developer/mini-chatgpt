const express = require("express");
const Event = require("../models/eventModel");
const User = require("../models/userModel");

const router = express.Router();

// Create event
router.post("/", async (req, res) => {
  try {
    const { title, description, createdBy, startDate, endDate, location, category, isOnline, link } = req.body;

    const event = await Event.create({
      title,
      description,
      createdBy,
      startDate,
      endDate,
      location,
      category,
      isOnline,
      link,
      attending: [createdBy]
    });

    res.json({ message: "Event created", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating event", error: err.message });
  }
});

// Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find({ startDate: { $gte: new Date() } })
      .populate("createdBy", "name")
      .populate("attending", "name")
      .sort({ startDate: 1 });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching events", error: err.message });
  }
});

// Get single event
router.get("/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate("createdBy", "name email")
      .populate("attending", "name")
      .populate("interested", "name");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching event", error: err.message });
  }
});

// RSVP - Mark as attending
router.post("/:eventId/attend", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Remove from interested and notGoing if present
    event.interested = event.interested.filter(u => u.toString() !== userId);
    event.notGoing = event.notGoing.filter(u => u.toString() !== userId);

    // Add to attending if not already
    if (!event.attending.includes(userId)) {
      event.attending.push(userId);
    }

    await event.save();
    res.json({ message: "Attending event", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating RSVP", error: err.message });
  }
});

// Mark as interested
router.post("/:eventId/interested", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.attending = event.attending.filter(u => u.toString() !== userId);
    event.notGoing = event.notGoing.filter(u => u.toString() !== userId);

    if (!event.interested.includes(userId)) {
      event.interested.push(userId);
    }

    await event.save();
    res.json({ message: "Marked as interested", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating interest", error: err.message });
  }
});

// Mark as not going
router.post("/:eventId/not-going", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.attending = event.attending.filter(u => u.toString() !== userId);
    event.interested = event.interested.filter(u => u.toString() !== userId);

    if (!event.notGoing.includes(userId)) {
      event.notGoing.push(userId);
    }

    await event.save();
    res.json({ message: "Marked as not going", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating RSVP", error: err.message });
  }
});

module.exports = router;
