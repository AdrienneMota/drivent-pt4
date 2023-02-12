import { createBooking, getBooking } from "@/controllers/booking-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const bookingsRouter = Router()

bookingsRouter
    .all("/*", authenticateToken)
    .get("/", getBooking)
    .post("/", createBooking)
    // .put("/:bookingId", updateBooking)

export default bookingsRouter