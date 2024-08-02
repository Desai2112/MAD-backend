import mongoose, { Schema } from "mongoose";
import { IUser, userRole } from "../Models/user";

export type loginBodyType = { email: string; password: string };

export type SignUpBodyType = {
  name: string;
  email: string;
  password: string;
  mobileNo:string;
  role?:userRole;
};

export type loginResponseBodyType = {
  message: string;
  userDetails: {
    id: Schema.Types.ObjectId;
    name: string;
    email: string;
    mobileNo:string;
    role:string;
    createdAt: Date;
    updatedAt: Date;
  };
  success: Boolean;
};

export type SignUpResponseBodyType = {
  message: string;
  userDetails: {
    id: Schema.Types.ObjectId;
    name: string;
    email: string;
    mobileNo:string;
    createdAt: Date;
    updatedAt: Date;
    profilePic:String;
  };
  success: Boolean;
};

export type MeResponseBodyType = {
  message: string;
  user: IUser;
  success: Boolean;
};
