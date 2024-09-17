import { Router } from "express";
import { showAllSports } from "../Controllers/common.controller";

const router = Router();

router.route("/sports").get(showAllSports);

export default router;