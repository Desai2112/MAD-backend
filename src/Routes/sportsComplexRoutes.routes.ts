import { Router } from "express";
import { addComplex, editComplexDetails, findComplexbySports, findComplexebyCity, getComplexDetails, showAllComplex, showClientComplex } from "../Controllers/sportcomplexs.controller";
import isAuthenticated from "../Middlewares/isAuthenticated";
import isManager from "../Middlewares/isManager";

const router = Router();

router.route("/add").post(addComplex);
router.route("/detail/:complexId").get(getComplexDetails);
router.route("/all").get(showAllComplex);
router.route("/city/:city").get(findComplexebyCity);
router.route("/sport/:sportName").get(findComplexbySports);
router.route("/client").get(isAuthenticated,isManager,showClientComplex);
router.route("/update/:complexId").put(isAuthenticated,isManager,editComplexDetails);

export default router;