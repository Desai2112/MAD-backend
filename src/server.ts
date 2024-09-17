import express, { Request, Response } from "express";
import { connectDB } from "./DB/connectDb";
import session from "express-session";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import "./index.d.ts";
import cors from "cors";


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const secret = process.env.Session_Secret || "abcdfekhb4efc5f4";


app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(express.json());
app.use(express.static("public"));


connectDB();
app.listen(port, () => {
  console.log(`App is litsening on port ${port}`);
});

app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    name: "user",
    store: MongoStore.create({
      client: mongoose.connection.getClient(),
      dbName: process.env.DB_NAME,
      collectionName: "sessions",
      stringify: false,
      autoRemove: "interval",
      autoRemoveInterval: 1,
    }),
  }),
);
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));



//session Configuration


//Routes import
import authRoutes from "./Routes/authRoutes.routes";
import paymentroute from "./configuration/stripeConfigure"
import complexRoutes from "./Routes/sportsComplexRoutes.routes"
import bookingRoute from "./Routes/bookingroute.routes"
import commonRoutes from "./Routes/common.routes"
// import managerRoutes from "./Routes/manager.route"

//Routes declaration
app.use("/auth", authRoutes);
app.use("/complex",complexRoutes);
app.use("/booking",bookingRoute);
app.use("/payment",paymentroute);
app.use("/common",commonRoutes)
// app.use("/manager",managerRoutes);
