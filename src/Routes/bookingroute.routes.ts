import { Router } from "express";
import {approveBooking, bookComplex, rejectBooking, showAllBookingReqests} from "../Controllers/booking.controller";
import isManager from "../Middlewares/isManager";
import isAuthenticated from "../Middlewares/isAuthenticated";

const router=Router();

router.route("/add").post(bookComplex);
router.route("/requests").get(isAuthenticated,isManager,showAllBookingReqests);
router.route("/accept/:bookingId").put(isAuthenticated,isManager,approveBooking)
router.route("/reject/:bookingId").put(isAuthenticated,isManager,rejectBooking)

export default router;