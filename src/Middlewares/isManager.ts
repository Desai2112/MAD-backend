import { Request, Response, NextFunction } from "express";
import { User } from "../Models/user";
import { GenericResponseType } from "../Schemas/genericResponse.schema";

const isManager = async (
  req: Request,
  res: Response<GenericResponseType>,
  next: NextFunction,
) => {
  if (req.session && req.session.user) {
    const userId = req.session.user;
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }
    // console.log(existingUser);
    if (existingUser.role == "Manager") {
      next();
    } else {
      return res
        .status(401)
        .json({
          message:
            "You are not authorized to use this endpoint you are not a Manager.",
          success: false,
        });
    }
  } else {
    return res.status(401).json({ message: "Login again.", success: false });
  }
};

export default isManager;
