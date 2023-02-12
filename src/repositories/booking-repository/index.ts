import { prisma } from "@/config";

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

async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
        userId,
        roomId
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


const bookingRepository = {
  findByUserId,
  createBooking,
  countByRoomId,
  findById
};

export default bookingRepository;
