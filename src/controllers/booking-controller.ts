import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req
    try {
        const bookings = await bookingService.getBooking(userId);

        return res.status(httpStatus.OK).send(bookings);
    } catch (error) {
        return res.sendStatus(httpStatus.NO_CONTENT);
    }
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req
  const { roomId } = req.body

  try {
    const bookingId = await bookingService.createBooking(userId, roomId);

    return res.status(httpStatus.OK).send(bookingId);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

