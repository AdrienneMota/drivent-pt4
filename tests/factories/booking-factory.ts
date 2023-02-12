import faker from "@faker-js/faker";
import { prisma } from "@/config";

//Sabe criar objetos - Uma reserva no banco
export async function createBooking(userId:number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}


