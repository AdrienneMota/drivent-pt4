import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/bookings-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req
    try {
        const booking = await bookingService.getBooking(userId);

        return res.status(httpStatus.OK).json(booking);
    } catch (error) {
      if(error.name === "CannotListHotelsError"){
        return res.sendStatus(httpStatus.PAYMENT_REQUIRED)
      }
      return res.sendStatus(httpStatus.NOT_FOUND)
    }
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req
  const { roomId } = req.body

  try {
    const bookingId = await bookingService.createBooking(userId, roomId);

    return res.status(httpStatus.OK).json({ id: bookingId});
  } catch (error) {
    if(error.name === "CannotListHotelsError"){
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED)
    }
    if(error.name === "noVacanciesError"){
      return res.sendStatus(httpStatus.FORBIDDEN)
    }
    return res.sendStatus(httpStatus.NOT_FOUND)
}
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req
  const bookingId  = parseInt(req.params.bookingId)
  const { roomId } = req.body


  try {
    const newBookingId = await bookingService.updateBooking(userId, bookingId, roomId);

    return res.status(httpStatus.OK).json({ id: newBookingId});
  } catch (error) {
    if(error.name === "CannotListHotelsError"){
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED)
    }
    if(error.name === "noVacanciesError"){
      return res.sendStatus(httpStatus.FORBIDDEN)
    }
    return res.sendStatus(httpStatus.NOT_FOUND)
  }
}