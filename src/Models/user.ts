import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export enum userRole {
  user = "User",
  manager = "Manager",
}

export interface IUser {
  googleId?: string;
  name: string;
  email: string;
  password: string;
  role: userRole;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  mobileNo: string;
  emailVerified:boolean;
  profilePic: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isPasswordSet:boolean;
}

export interface IUserModel extends IUser, Document {
  comparePassword(password: string): Promise<boolean>;
  createPasswordResetToken(): Promise<string>;
  passwordResetExpires: Date;
  _id:Schema.Types.ObjectId;
}

const userSchema: Schema<IUserModel> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(userRole),
      default: userRole.user,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
      required: true,
    },
    mobileNo: {
      type: String,
      // required: true,
    },
    profilePic: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    emailVerified:{
      type:Boolean,
      default:false,
    },
    isPasswordSet:{
      type:Boolean,
      default:true,
    }
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userSchema.pre<IUserModel>("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    next();
  } catch (error) {
    return (error);
  }
});

userSchema.methods.comparePassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw (error);
  }
};

userSchema.methods.createPasswordResetToken =
  async function (): Promise<string> {
    const user = this as IUserModel;
    const resetToken = bcrypt.genSaltSync(10);
    const hashedToken = bcrypt.hashSync(resetToken, 10);
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return resetToken;
  };

export const User = mongoose.model<IUserModel>("User", userSchema);
