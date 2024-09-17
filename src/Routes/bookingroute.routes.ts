import { Router } from "express";
import {bookComplex} from "../Controllers/booking.controller";

const router=Router();

router.route("/add").post(bookComplex)

export default router;