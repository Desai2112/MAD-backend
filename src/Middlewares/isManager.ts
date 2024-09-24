import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../Models/user";
import { GenericResponseType } from "../Schemas/genericResponse.schema";

const isManager = async (
  req: Request,
  res: Response<GenericResponseType>,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Access token is missing", success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const existingUser = await User.findById(decoded.userId);

    if (!existingUser) {
      return res.status(400).json({ message: "User not found", success: false });
    }

    if (existingUser.role === "Manager") {
      next();
    } else {
      return res.status(401).json({
        message: "You are not authorized to use this endpoint. You are not a Manager.",
        success: false,
      });
    }
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized or invalid token", success: false });
  }
};

export default isManager;
