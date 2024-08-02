import { Request, Response, NextFunction } from "express";
import { GenericResponseType } from "../Schemas/genericResponse.schema";

const isAuthenticated = async (
  req: Request,
  res: Response<GenericResponseType>,
  next: NextFunction,
) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized", success: false });
  }
};

export default isAuthenticated;
