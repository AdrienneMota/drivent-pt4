import { TicketStatus } from "@prisma/client";
import { createBooking, createEnrollmentWithAddress, createHotel, createPayment, createRoomWithHotelId, createTicket, createTicketType, createTicketTypeRemote, createTicketTypeWithHotel, createUser, updateTicketType } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import app, { init } from "@/app";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";


beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe("get/booking/", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/booking/")

        expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    })

    it("should respond with status 401 if token is not valid", async () => {
        const token = faker.lorem.word

        const response = await server.get("/booking/").set("Authorization", `Bearer ${token}`)

        expect(response.status).toBe(httpStatus.UNAUTHORIZED)
    })

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/booking/").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("When token is valid", () => {
        it("should respond with 404 if enrollment not exist", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)

            const response = await server.get("/booking/").set("Authorization", `Bearer ${token}`)

            expect(response.status).toBe(httpStatus.NOT_FOUND)
        })

        it("should respond with 402 if ticket not exist", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)

            const response = await server.get("/booking/").set("Authorization", `Bearer ${token}`)

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)
        })

        it("should respond with status 402 when user ticket is remote ", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeRemote();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);

            const response = await server.get("/booking/").set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 402 when user ticket is not paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType();
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)

            const response = await server
                .get("/booking/").set("Authorization", `Bearer ${token}`)

            expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 402 when user ticket type don't includes hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType();
            await updateTicketType({ ...ticketType, isRemote: false, includesHotel: false })
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED)

            const response = await server
                .get("/booking/")
                .set("Authorization", `Bearer ${token}`)

            expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 404 when user don't has booking", async () => {
            const user = await createUser()
            const token = await generateValidToken(user)
            const enrollment = await createEnrollmentWithAddress(user)
            const ticketType = await createTicketTypeWithHotel()
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID)
            const payment = await createPayment(ticket.id, ticketType.price)
            const hotel = await createHotel()
            const room = await createRoomWithHotelId(hotel.id)

            const response = await server.get("/booking/").set("Authorization", `Bearer ${token}`)

            expect(response.status).toBe(httpStatus.NOT_FOUND)
        })

        it("sucess", async () => {
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
            expect(response.body).toEqual({ id: booking.id, Room: { ...room, createdAt: room.createdAt.toISOString(), updatedAt: room.updatedAt.toISOString() } })

        })
    })
})

