import mongoose, { Document, Schema } from "mongoose";


export enum bookingStatus{
  booked="Booked",
  completed="Completed",
  cancelled="Cancelled"
}

export enum approvalStatus{
  pending="Pending",
  approved="Approved",
  rejected="Rejected"
}

export enum bookingType{
  maintenance="Maintanance",
  regular="Regular"
}
export type IBooking = {
  user: Schema.Types.ObjectId;
  sportComplex: Schema.Types.ObjectId;
  sport: Schema.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: bookingStatus; 
  approvalStatus: approvalStatus;
  type:bookingType;
  createdAt: Date;
  updatedAt: Date;
};

export type IBookingModel = IBooking &
  Document & {
    _id: Schema.Types.ObjectId;
  };

export const bookingSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sportComplex: {
      type: Schema.Types.ObjectId,
      ref: "SportComplex",
      required: true,
    },
    sport: {
      type: Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum:bookingStatus,
      default: bookingStatus.booked,
      required: true,
    },
    approvalStatus: {
      type: String,
      enum: approvalStatus,
      default: approvalStatus.pending,
      required: true,
    },
    type:{
      type:String,
      enum:bookingType,
      default:bookingType.regular,
      required:true,
    }
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const Booking = mongoose.model<IBookingModel>("Booking", bookingSchema);
