import express, { Request, Response } from "express";
import { SportComplex } from "../Models/sportComplexs";
import { User } from "../Models/user";
import { Sport } from "../Models/sports";

const addComplex = async (req: Request, res: Response) => {
  try {
    const {
      name,
      address,
      phone,
      email,
      city,
      openingTime,
      closingTime,
      pricePerHour,
      description,
      sports,
      images,
    } = req.body;
    console.log(req.body);
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
      !description ||
      !sports ||
      !images
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all the fields", success: false });
    }
    const user = await User.findById(managerId);
    if (!user) {
      return res.status(400).json({
        message: "Manager not found login again to continue.",
        success: false,
      });
    }
    const existingComplex = await SportComplex.findOne({
      name: name,
      manager: managerId,
    });
    if (existingComplex) {
      return res.status(400).json({
        message: "Complex already exists",
        success: false,
      });
    }
    const complex = await SportComplex.create({
      name: name,
      address: address,
      phone: phone,
      city: city,
      email: email,
      openingTime: openingTime,
      closingTime: closingTime,
      pricePerHour: pricePerHour,
      description: description,
      sports: sports,
      images: images,
      manager: managerId,
    });
    console.log(complex);
    return res.status(201).json({
      message: "Complex created successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error try again later.",
      success: false,
    });
  }
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

const showClientComplex = async (req: Request, res: Response) => {
  try {
    const allComplex = await SportComplex.find({
      manager: req.session.user,
      deleted: false,
    })
      .select("-deleted -createdAt -updatedAt")
      .populate("sports", "name _id");
    return res.status(200).json({
      message: "Complex fetched successfully.",
      allComplex,
      success: true,
    });
  } catch (error) {
    console.error("Error getting all complex:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

const editComplexDetails = async (req: Request, res: Response) => {
  const { complexId } = req.params;
  try {
    const complex = await SportComplex.findById(complexId);
    if (!complex) {
      return res.status(404).json({
        message: "Complex not found",
        success: false,
      });
    }
    const mId = complex.manager.toString();
    const uId = req.session.user?.toString();
    // console.log(mId);
    // console.log(uId);
    if (mId != uId) {
      return res.status(403).json({
        message: "You are not authorized to edit this complex",
        success: false,
      });
    }
    const {
      email,
      phone,
      openingTime,
      closingTime,
      pricePerHour,
      description,
    } = req.body;
    if (
      !phone ||
      !email ||
      !openingTime ||
      !closingTime ||
      !pricePerHour ||
      !description
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all the fields", success: false });
    }
    const updatedComplex = await SportComplex.findByIdAndUpdate(
      complexId,
      {
        phone: phone,
        email: email,
        openingTime: openingTime,
        closingTime: closingTime,
        pricePerHour: pricePerHour,
        description: description,
      },
      { new: true },
    );
    return res.status(200).json({
      message: "Complex updated successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error try again later.",
      success: false,
    });
  }
};

const addSportinComplex = async (req: Request, res: Response) => {
  try {
    const { complexId, sports } = req.body;
    if (!complexId || !sports) {
      return res.status(400).json({
        message: "Please fill all the fields",
        success: false,
      });
    }
    const complex = await SportComplex.findByIdAndUpdate({ complexId },{
      $addToSet: { sports: sports }
    });
    if (!complex) {
      return res.status(400).json({
        message: "Sport already exists in this complex",
        success: false,
      });
    }
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error try again later.",
      success: false,
    });
  }
};

export {
  addComplex,
  getComplexDetails,
  showAllComplex,
  findComplexbySports,
  findComplexebyCity,
  showClientComplex,
  editComplexDetails,
};
