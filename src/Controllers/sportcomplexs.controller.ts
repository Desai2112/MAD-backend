import express, { Request, Response } from "express";
import { SportComplex } from "../Models/sportComplexs";
import { User } from "../Models/user";
import { Sport } from "../Models/sports";

const addComplex = async (req: Request, res: Response) => {
  const {
    name,
    address,
    phone,
    city,
    email,
    openingTime,
    closingTime,
    pricePerHour,
    description,
    sports,
  } = req.body;

  const managerId = req.session.user;

  if (
    !name ||
    !address ||
    !phone ||
    !city ||
    !email ||
    !openingTime ||
    !closingTime ||
    !pricePerHour ||
    !description
  ) {
    res
      .status(400)
      .json({ message: "Please fill all the fields", success: false });
  }
    const user= await User.findById(managerId);
    if(!user){
      return res.status(400)
      .json({ message: "Manager not found login again to continue.", success: false });
    }
    const sportIds = await Promise.all(
      sports.map(async (name: string) => {
        const sport = await Sport.findOne({ name });
        if(!sport){
          const newSport=new Sport({
            name:name,
          });
          await newSport.save();
          return newSport._id;
        }
        return sport._id;
      }),
    );

    

};

const getComplexDetails = async (req: Request, res: Response) => {
  const { complexId } = req.params;
  try {
    const complexDetails = await SportComplex.findById(complexId)
      .select("-deleted -createdAt -updatedAt")
      .populate("manager", "name email phone")
      .populate("sports", "name");
    if (complexDetails) {
      res.status(200).json({ complexDetails, success: true });
    } else {
      res.status(404).json({ message: "Complex not found", success: false });
    }
  } catch (error) {
    console.error("Error getting complex details:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const showAllComplex = async (req: Request, res: Response) => {
  try {
    const allComplex = await SportComplex.find({ deleted: false })
      .select("-deleted -createdAt -updatedAt")
      .populate("sports", "name _id");
    res.status(200).json({ allComplex, success: true });
  } catch (error) {
    console.error("Error getting all complex:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const findComplexbySports = async (req: Request, res: Response) => {
  const { sportName } = req.params;
  try {
    const sportId = await Sport.find({ name: sportName }).select("_id");
    const complexDetails = await SportComplex.find({ sports: { $in: sportId } })
      .populate("manager", "name email phone")
      .populate("sports", "name -_id");
    res.status(200).json({ complexDetails, success: true });
  } catch (error) {
    console.error("Error getting complex details:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

const findComplexebyCity = async (req: Request, res: Response) => {
  const { city } = req.params;
  try {
    const complexDetails = await SportComplex.find({ city: city })
      .populate("manager", "name email phone")
      .populate("sports", "name -_id");
    res.status(200).json({ complexDetails, success: true });
  } catch (error) {
    console.error("Error getting complex details:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

export {
  addComplex,
  getComplexDetails,
  showAllComplex,
  findComplexbySports,
  findComplexebyCity,
};
