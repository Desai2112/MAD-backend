import { Request, Response } from "express";
import { Sport } from "../Models/sports";
import { SportComplex } from "../Models/sportComplexs";
import { approvalStatus, Booking, bookingStatus } from "../Models/booking";
import { User, userRole } from "../Models/user";
import { sendWp } from "../configuration/whatsappSender";
import { sendEmail } from "../configuration/mailconfigure";

const bookComplex = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "You must be logged in to book a sport complex",
        success: false,
      });
    }
    const { sportComplexId, sportId, startTime, endTime, bookingType } =
      req.body;
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({
        message: "You must be logged in to book a sport complex",
        success: false,
      });
    }

    const sportComplex =
      await SportComplex.findById(sportComplexId).select("manager sports");
    const sport = await Sport.findById(sportId);
    const user = await User.findById(userId);

    if (!sportComplex) {
      return res.status(404).json({
        message: "Sport complex not found",
        success: false,
      });
    } else {
      console.log(sportComplex.manager);
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
    const sportAvailableInComplex = sportComplex.sports.includes(sport._id);
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
      approvalStatus: approvalStatus.approved,
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
      managerId: sportComplex.manager,
      startTime,
      endTime,
      bookingType,
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
    if (!req.user) {
      return res.status(401).json({
        message: "You must be logged in to see your booking requests.",
        success: false,
      });
    }

    const mId = req.user.userId;
    if (!mId) {
      return res.status(401).json({
        message: "Log in to see your booking requests.",
        success: false,
      });
    }
    const bookingRequests = await Booking.find({
      managerId: mId,
      // approvalStatus: "Pending",
    })
      .populate("user", "name email")
      .populate("sportComplex", "name")
      .populate("sport", "name");

    res.status(200).json({
      message: "Bookings fetched successfully.",
      bookingRequests,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching booking requests:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};


const approveBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    // Find the booking to approve
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found", success: false });
    }

    // Approve the current booking
    booking.approvalStatus = approvalStatus.approved;
    booking.status = bookingStatus.completed;
    await booking.save();

    const msg = "Your booking is confirmed";
    sendWp(msg);

    // Reject all other pending bookings that overlap with the approved booking's time slot
    await Booking.updateMany(
      {
        sportComplex: booking.sportComplex,
        sport: booking.sport,
        approvalStatus: "Pending",
        // Condition to find all bookings that overlap with the approved booking
        $or: [
          {
            startTime: { $lt: booking.endTime },
            endTime: { $gt: booking.startTime },
          },
        ],
        _id: { $ne: bookingId }, // Exclude the approved booking
      },
      {
        approvalStatus: approvalStatus.rejected,
        status: bookingStatus.cancelled,
      },
    );

    console.log(
      "Booking approved successfully and overlapping requests rejected:",
      booking,
    );

    return res.status(200).json({
      message:
        "Booking approved successfully and overlapping requests rejected",
      success: true,
    });
  } catch (error) {
    console.error("Error approving booking:", error);
    return res.status(500).json({
      message: "Internal server error. Try again later.",
      success: false,
    });
  }
};

const rejectBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    // Find the booking to reject
    const booking =
      await Booking.findById(bookingId).populate("sportComplex", "manager");
    if (!booking) {
      return res
        .status(404)
        .json({ message: "Booking not found", success: false });
    }
    // Check if the booking is already approved or rejected
    if (
      booking.approvalStatus === approvalStatus.approved ||
      booking.approvalStatus === approvalStatus.rejected
    ) {
      return res.status(400).json({
        message: "Booking already processed",
        success: false,
      });
    }
    // Reject the booking
    booking.approvalStatus = approvalStatus.rejected;
    booking.status = bookingStatus.cancelled;
    await booking.save();
    console.log("Booking rejected successfully:", booking);
    return res.status(200).json({
      message: "Booking rejected successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error rejecting booking:", error);
    return res.status(500).json({
      message: "Internal server error. Try again later.",
      success: false,
    });
  }
};

const showPlayerBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "You must be logged in to see your bookings",
        success: false,
      });
    }
    const userId = req.user.userId;
    const bookings = await Booking.find({ user: userId })
      .populate("sportComplex", "name")
      .populate("sport", "name")
      .exec();
    return res.status(200).json({
      message: "Bookings fetched successfully",
      bookings,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({
      message: "Internal server error. Try again later.",
      success: false,
    });
  }
};

export {
  bookComplex,
  showAllBookingReqests,
  approveBooking,
  rejectBooking,
  showPlayerBookings,
};
