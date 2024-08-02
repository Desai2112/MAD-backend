import mongoose, { Document, ObjectId, Schema } from "mongoose";

export type ISportComplex = {
  name: string;
  address: string;
  phone: string;
  email: string;
  city:string;
  openingTime:Date;
  closingTime:Date;
  pricePerHour:Number;
  description: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  manager:Schema.Types.ObjectId;
  sports: Schema.Types.ObjectId[];
  images:string[];
};

export type ISportComplexModel = ISportComplex &
  Document & {
    _id: Schema.Types.ObjectId;
  };

export const sportComplexSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city:{
      type:String,
      required:true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    openingTime: {
      type: Date,
      required: true,
    },
    closingTime: {
      type: Date,
      required: true,
    },
    pricePerHour: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
      required: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sports: [
      {
        type: Schema.Types.ObjectId,
        ref: "Sport",
      },

    ],
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const SportComplex = mongoose.model<ISportComplexModel>(
  "SportComplex",
  sportComplexSchema,
);
