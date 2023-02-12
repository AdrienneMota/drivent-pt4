import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError, noVacanciesError } from "@/errors";
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
  
  if(!booking){
    throw notFoundError();
  }

  return {
    id: booking.id,
    Room: booking.Room
  };

}

async function createBooking(userId: number, roomId: number) {
  await validateTicketBooking(userId);
  
  
  const room = await bookingRepository.findById(roomId);
  if(!room){
    throw notFoundError()
  }
  
  const countBooking = await bookingRepository.countByRoomId(roomId)
  console.log(countBooking)
  
  if(countBooking[0]._count < room.capacity){
    throw noVacanciesError()
  }  
  
  const newBooking = { userId, roomId}
  const booking = await bookingRepository.createBooking(newBooking);

  return booking.id;
}

async function updateBooking(userId: number, roomId: number) {
  await validateTicketBooking(userId);
  const bookingExist = await bookingService.getBooking(userId)
  if(!bookingExist){
    throw notFoundError()
  }
  
  const room = await bookingRepository.findById(roomId);
  if(!room){
    throw notFoundError()
  }

  const countBooking = await bookingRepository.countByRoomId(roomId)
  console.log(countBooking)
  if(countBooking[0]._count >= room.capacity){
    throw noVacanciesError()
  }  
  const booking = await bookingRepository.updateBooking(bookingExist.id, roomId);

  return booking.id;
}

const bookingService = {
  getBooking,
  createBooking,
  updateBooking
};

export default bookingService;
