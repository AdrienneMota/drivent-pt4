import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError } from "@/errors";
import { cannotListHotelsError } from "@/errors/cannot-list-hotels-error";
import bookingRepository from "@/repositories/booking-repository";

async function validateTicketBooking(userId: number) {
  //Tem enrollment?
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  //Tem ticket pago isOnline false e includesHotel true
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotListHotelsError();
  }
}

async function getBooking(userId: number) {
  await validateTicketBooking(userId);

  const booking = await bookingRepository.findByUserId(userId);
  return {
    id: booking.id,
    Room: booking.Room
  };
}

async function createBooking(userId: number, roomId: number) {
  await validateTicketBooking(userId);
  const countBooking = await bookingRepository.countByRoomId(roomId)
  console.log(countBooking)
  const room = await bookingRepository.findById(roomId);
  if(countBooking[0]._count < room.capacity){
    //erro 403
  }  
  const booking = await bookingRepository.createBooking(userId, roomId);

  return booking.id;
}

const bookingService = {
  getBooking,
  createBooking
};

export default bookingService;
