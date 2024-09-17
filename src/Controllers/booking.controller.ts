import { Request, Response } from "express";
import { Sport } from "../Models/sports";
import { SportComplex } from "../Models/sportComplexs";
import { Booking } from "../Models/booking";
import { User, userRole } from "../Models/user";
import { sendWp } from "../configuration/whatsappSender";
import { sendEmail } from "../configuration/mailconfigure";


const bookComplex = async (req: Request, res: Response) => {
  try {
    const { sportComplexId, sportId, startTime, endTime, bookingType } = req.body;
    const userId = req.session.user;
    if (!userId) {
      return res.status(401).json({
        message: "You must be logged in to book a sport complex",
        success: false,
      });
    }

    const sportComplex = await SportComplex.findById(sportComplexId);
    const sport = await Sport.findById(sportId);
    const user = await User.findById(userId);

    if (!sportComplex) {
      return res.status(404).json({
        message: "Sport complex not found",
        success: false,
      });
    }

    if (!sport) {
      return res.status(404).json({
        message: "Sport not found",
        success: false,
      });
    }

    if (!user || user.role !== userRole.user) {
      return res.status(403).json({
        message: "User not found or not authorized",
        success: false,
      });
    }

    // Check if the sport is available in the complex
    const sportAvailableInComplex = sportComplex.sports.includes(sportId);
    if (!sportAvailableInComplex) {
      return res.status(400).json({
        message: "This sport is not available in the selected complex",
        success: false,
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      sportComplex: sportComplexId,
      sport: sportId,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflictingBooking) {
      return res.status(403).json({
        message: "Time slot already booked",
        success: false,
      });
    }

    // Create a new booking with pending approval
    const booking = new Booking({
      user: userId,
      sportComplex: sportComplexId,
      sport: sportId,
      startTime,
      endTime,
      bookingType, // Include bookingType if needed
    });

    await booking.save();

    // Notify via email
    const recipient = "desaiom2112@gmail.com";
    const subject = "Booking Request";
    const message = "New Booking request encountered.";
    sendEmail(recipient, subject, message);

    console.log("Booking request created successfully:", booking);

    return res.status(200).json({
      message: "Booking request created successfully",
      booking,
      success: true,
    });
  } catch (error) {
    console.error("Error creating booking request:", error);
    return res.status(500).json({
      message: "Internal server error. Try again later.",
      success: false,
    });
  }
};

const showAllBookingReqests = async (req: Request, res: Response) => {
  try {
    const bookingRequests = await Booking.find({
      approvalStatus: "pending",
    }).populate("user sportComplex sport");
    res.status(200).json({ bookingRequests, success: true });
  } catch (error) {
    console.error("Error fetching booking requests:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const approveBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { approvalStatus: "approved" },
      { new: true },
    );
    const msg = "your booking is conforimed";
    sendWp(msg);
    if (!booking) {
      return res
        .status(403)
        .json({ message: "Booking not found", success: false });
    }

    console.log("Booking approved successfully:", booking);
    return booking;
  } catch (error) {
    console.error("Error approving booking:", error);
    throw error;
  }
};

const rejectBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const msg = "your booking is rejected";
    sendWp(msg);
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { approvalStatus: "rejected" },
      { new: true },
    );

    if (!booking) {
      throw new Error("Booking not found");
    }

    console.log("Booking rejected successfully:", booking);
    return booking;
  } catch (error) {
    console.error("Error rejecting booking:", error);
    throw error;
  }
};

const seeAvailability = async (req: Request, res: Response) => {
  const { sportComplexId, startTime, endTime } = req.body;

  try {
    const bookings = await Booking.find({
      sportComplex: sportComplexId,
      $or: [
        {
          startTime: { $lte: new Date(startTime) },
          endTime: { $gte: new Date(startTime) },
        },
        {
          startTime: { $lte: new Date(endTime) },
          endTime: { $gte: new Date(endTime) },
        },
        {
          startTime: { $gte: new Date(startTime) },
          endTime: { $lte: new Date(endTime) },
        },
      ],
    });

    if (bookings.length > 0) {
      res.json({ available: false, bookings });
    } else {
      res.json({ available: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching data.", success: false });
  }
};

export {
  bookComplex,
  showAllBookingReqests,
  approveBooking,
  rejectBooking,
  seeAvailability,
};
