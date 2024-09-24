import { Router } from "express";
import {
  addUser,
  // continueWithGoogle,
  // emailVerification,
  getDetails,
  // googleCallBack,
  loginUser,
  logOut,
  // verifyEmail,
} from "../Controllers/user.controller";
import {
  loginBodyType,
  SignUpBodyType,
  loginResponseBodyType,
  SignUpResponseBodyType,
  MeResponseBodyType,
} from "../Schemas/user.schema";
import { GenericResponseType } from "../Schemas/genericResponse.schema";
import { upload } from "../Middlewares/multer";
import isAuthenticated from "../Middlewares/isAuthenticated";

const router = Router();

// router.route("/signup").post(upload.single("profilePic"), addUser);

router
  .route("/login")
  .post<
    any,
    loginResponseBodyType | GenericResponseType,
    loginBodyType
  >(loginUser);

router
  .route("/me")
  .get<any, MeResponseBodyType | GenericResponseType>(isAuthenticated,getDetails);

// router.post("/signup", upload.single("profilePic"), tempUpload);
router.route("/logout").delete<any, GenericResponseType>(logOut);
// router.route("/verify").post(emailVerification);
// router.route("/verify-email").get(verifyEmail);

// router.route("/google/:role").get(continueWithGoogle);
// router.route("/google/callback/:role").get(googleCallBack);

router.route("/signup").post(addUser);

export default router;
