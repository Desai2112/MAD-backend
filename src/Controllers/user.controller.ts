import { User, userRole } from "../Models/user";
import { Request, Response, NextFunction } from "express";
import validator from "validator";
import {
  loginBodyType,
  loginResponseBodyType,
  MeResponseBodyType,
  SignUpBodyType,
  SignUpResponseBodyType,
} from "../Schemas/user.schema";
import { GenericResponseType } from "../Schemas/genericResponse.schema";
import { uploadOnCloudinary } from "../configuration/cloudinary";
import { sendEmail } from "../configuration/mailconfigure";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose, { Schema } from "mongoose";
import axios from "axios";

const addUser = async (
  req: Request<
    any,
    SignUpResponseBodyType | GenericResponseType,
    SignUpBodyType
  >,
  res: Response<SignUpResponseBodyType | GenericResponseType>,
) => {
  try {
    const { name, email, password, mobileNo, role, profileUrl } = req.body;
     console.log(req.body);

    if (!name || !email || !password || !mobileNo || !profileUrl) {
      return res.status(400).json({
        message: "All the fields are required.",
        success: false,
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Email is not valid.",
        success: false,
      });
    }

    if (!validator.isMobilePhone(mobileNo, ["en-IN"])) {
      return res.status(400).json({
        message: "Mobile number is not valid.",
        success: false,
      });
    }

    if (!validator.isLength(password, { min: 8 })) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
        success: false,
      });
    }

    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({
        message: "User with this email already exists.",
        success: false,
      });
    }

    const userRoleType = role || userRole.user;
    const newUser = new User({
      name: name,
      email: email,
      password: password,
      mobileNo: mobileNo,
      role: userRoleType,
      profilePic: profileUrl,
    });

    await newUser.save();
    req.session.user=newUser._id;

    res.status(201).json({
      message: "User created successfully.",
      userDetails: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobileNo: newUser.mobileNo,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
        profilePic: newUser.profilePic,
      },
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

const loginUser = async (
  req: Request<any, loginResponseBodyType | GenericResponseType, loginBodyType>,
  res: Response<loginResponseBodyType | GenericResponseType>,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    // console.log(req.body)
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password.",
      });
    }

    req.session.user = user._id;

    res.status(200).json({
      message: "Login successful.",
      userDetails: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const getDetails = async (
  req: Request<any, MeResponseBodyType | GenericResponseType>,
  res: Response<MeResponseBodyType | GenericResponseType>,
) => {
  try {
    const user = await User.findById(req.session.user).select(
      "-password -createdAt -updatedAt -deleted",
    );
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    res.status(200).json({
      message: "User found",
      user,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const logOut = async (
  req: Request<any, GenericResponseType>,
  res: Response<GenericResponseType>,
) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to log out", success: false });
      } else {
        res
          .status(200)
          .json({ message: "Logged out successfully", success: true });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const emailVerification = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.session.user).select(
      "-password -createdAt -updatedAt -deleted",
    );
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    console.log("Sending mail UserId:", user._id);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // Create verification URL
    const verificationUrl = `${req.protocol}://${req.get("host")}/user/verify-email?token=${token}`;

    // Send verification email
    const emailSubject = "Email Verification";
    const emailMessage = `Please click on the following link to verify your email address: ${verificationUrl}`;
    const emailHtmlMessage = `<p>Please click on the following link to verify your email address:</p><a href="${verificationUrl}">${verificationUrl}</a>`;

    const emailResponse = await sendEmail(
      user.email,
      emailSubject,
      emailHtmlMessage,
    );

    res.status(200).json({
      message: "Verification email sent",
      emailResponse,
      success: true,
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).json({
        message: "Token is required",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: mongoose.Types.ObjectId;
    };

    console.log(decoded.userId);

    const user = await User.findById(decoded.userId);
    console.log(user);

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
        success: false,
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified",
        success: false,
      });
    }

    user.emailVerified = true; // Ensure you have this field in your user model
    await user.save();

    res.status(200).json({
      message: "Email verified successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error during email verification:", error);
    res.status(400).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};

const continueWithGoogle = async (req: Request, res: Response) => {
  const { role } = req.params;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}/${role}&response_type=code&scope=profile email`;
  res.redirect(url);
};

const googleCallBack = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { code } = req.query;
  const { role } = req.params;
  console.log(role);
  let role1;
  if (role == "user") {
    role1 = userRole.user;
  } else {
    role1 = userRole.manager;
  }

  try {
    // Exchange authorization code for access token
    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.GOOGLE_REDIRECT_URI}/${role}`,
      grant_type: "authorization_code",
    });

    const { access_token, id_token } = data;
    // console.log(data);

    // Use access_token or id_token to fetch user profile
    const { data: profile } = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    // Check if user exists in the database
    let user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) {
      const randomString = crypto.randomBytes(20).toString("hex");
      user = new User({
        name: profile.name,
        email: profile.email,
        role: role1,
        profilePic: profile.picture,
        password: await bcrypt.hash(randomString, 10),
        isPasswordSet: false,
      });
      await user.save();
    }
    let newuser = await User.findOne({ email: profile.email.toLowerCase() });
    console.log(newuser);
    // await user.find({})
    console.log("Login Done");
    res.redirect(`${process.env.FRONTEND_URL}/${role}`);
  } catch (error) {
    console.error("Error in googleCallBack:", error); // Enhanced logging
    next({
      path: "/auth/google/callback",
      status: 500,
      message: "Authentication failed",
    });
  }
};

const tempUpload = async (req: Request, res: Response) => {
  console.log(req.file);
  const profilePicLocalpath = req.file?.path || "";
  console.log(profilePicLocalpath);
  let profileUrl = null;
  try {
    profileUrl = await uploadOnCloudinary(profilePicLocalpath);
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
  }
  console.log("Profile Url: ", profileUrl);
  res.send("Image uploading ");
  console.log("Done");
};
const rememberMe = async (req: Request, res: Response) => {};

export {
  addUser,
  loginUser,
  getDetails,
  logOut,
  emailVerification,
  verifyEmail,
  continueWithGoogle,
  googleCallBack,
  tempUpload,
};
