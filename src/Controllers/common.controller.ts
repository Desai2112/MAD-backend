import { Sport } from "../Models/sports";
import { Request,Response } from "express";

const showAllSports = async (req: Request, res: Response) => {
  try {
    const sports = await Sport.find().select("name _id");
    return res.status(200).json({
      message: "SPorts fetched succesfully.",
      sports,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching sports:", error);
    throw error;
  }
};

export { showAllSports };