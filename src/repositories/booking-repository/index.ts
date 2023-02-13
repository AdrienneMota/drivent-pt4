import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function findByUserId(userId : number) {
  return prisma.booking.findFirst({
    include: {
        Room: true,
    },
    where: {
        userId
    }    
  });
}

async function findBookingById(bookingId:number) {
  return prisma.booking.findFirst({
    where: { id: bookingId}
  })
}

async function createBooking(booking: CreateBookingParams) {
  return prisma.booking.create({
    data: {
        ...booking
    }
  })
}

async function countByRoomId(roomId : number) {
    return prisma.booking.groupBy({
       by: ["roomId"],
       where: { roomId },
       _count: true
    })
}

async function findById(roomId: number) {
    return prisma.room.findFirst({
        where: { id: roomId}
    })
}

async function updateBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    where: {
      id: bookingId
    },
    data: {
      roomId
    }
  })
}

export type CreateBookingParams = Omit<Booking, "id" | "createdAt" | "updatedAt">

const bookingRepository = {
  findByUserId,
  createBooking,
  countByRoomId,
  findById,
  updateBooking,
  findBookingById
};

export default bookingRepository;
