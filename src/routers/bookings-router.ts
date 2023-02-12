import { createBooking, getBooking, updateBooking } from "@/controllers/booking-controller";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const bookingsRouter = Router()

bookingsRouter
    .all("/*", authenticateToken)
    .get("/", getBooking)
    .post("/", createBooking)
    .put("/:bookingId", updateBooking)

export default bookingsRouter