import { TicketStatus } from "@prisma/client";
import { createBooking, createEnrollmentWithAddress, createHotel, createPayment, createRoomWithHotelId, createTicket, createTicketTypeWithHotel, createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import app, { init } from "@/app";
import httpStatus from "http-status";

beforeAll(async () => {
    await init();
  });
  
  beforeEach(async () => {
    await cleanDb();
  });
  
const server = supertest(app);

describe("get/booking/", () => {
    it("sucess", async() => {
        const user = await createUser()
        const token = await generateValidToken(user)
        const enrollment = await createEnrollmentWithAddress(user)
        const ticketType = await createTicketTypeWithHotel()
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
        const payment = await createPayment(ticket.id, ticketType.price)
        const hotel = await createHotel()
        const room = await createRoomWithHotelId(hotel.id)
        const booking = await createBooking(user.id, room.id)

        const response = await server.get("/booking/").set("Authorization", `Bearer ${token}`)
        
        expect(response.status).toBe(httpStatus.OK)
        expect(response.body).toEqual({id : booking.id, Room: {...room, createdAt: room.createdAt.toISOString(), updatedAt: room.updatedAt.toISOString()}})
        
    })
})