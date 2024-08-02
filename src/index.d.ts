import { Session, SessionData } from "express-session";
import { ObjectId } from "mongoose";

declare module "express-session" {
  interface SessionData {
    user: ObjectId | null;
  }
}
