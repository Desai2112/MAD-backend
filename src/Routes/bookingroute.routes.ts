import { Router } from "express";
import {approveBooking, bookComplex, rejectBooking, showAllBookingReqests, showPlayerBookings} from "../Controllers/booking.controller";
import isManager from "../Middlewares/isManager";
import isAuthenticated from "../Middlewares/isAuthenticated";
import isUser from "../Middlewares/isUser";

const router=Router();

router.route("/add").post(isAuthenticated,isUser,bookComplex);
router.route("/requests").get(isAuthenticated,isManager,showAllBookingReqests);
router.route("/player/requests").get(isAuthenticated,isManager,showPlayerBookings);
router.route("/accept/:bookingId").put(isAuthenticated,isManager,approveBooking)
router.route("/reject/:bookingId").put(isAuthenticated,isManager,rejectBooking)

export default router;