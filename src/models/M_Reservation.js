const { PrismaClient } = require("@prisma/client");
const reservationClient = new PrismaClient().reservation;

const getAllReservation = async () => {
	const reservations = await reservationClient.findMany({
		select: {
			agencyName: true,
			resvQty: {
				select: {
					manyAdult: true,
					manyChild: true,
					manyRoom: true,
				},
			},
			reserver: {
				select: {
					groupName: true,
					kCard: true,
					nation: true,
					resident: true,
				},
			},
			currency: true,
			code: true,
			fixRate: true,
			argtCode: true,
			day: true,
			night: true,
			arrivalDate: true,
			departureDate: true,
			checkoutDate: true,
			canceledDate: true,
			resvFlights: {
				select: {
					arrivalFlight: true,
					departureFlight: true,
				},
			},
			resvRooms: {
				select: {
					roomId: true,
					room: {
						select: {
							roomType: true,
						},
					},
				},
			},
		},
	});

	return reservations;
};

module.exports = { getAllReservation };
