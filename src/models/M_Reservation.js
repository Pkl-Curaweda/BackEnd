const { PrismaClient } = require("@prisma/client");
const prisma = require("../db");
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

const deleteReservation = async (id) => {
	try {
		await prisma.resvFlight.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.resvRoom.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.deposit.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.logReservation.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.canceledReservation.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.voucher.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.discrepancy.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.cleaningSheet.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.cleanRoom.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.dirtyRoom.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.oooRoom.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.guestPreference.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.task.deleteMany({
			where: {
				reservationId: id,
			},
		});

		await prisma.roomChange.deleteMany({
			where: {
				reservationId: id,
			},
		});

		const deleteResv = await reservationClient.deleteMany({
			where: {
				id: id,
			},
		});

		return deleteResv;
	} catch (error) {
		console.error("Error deleting reservation:", error);
		console.log("Error details:", JSON.stringify(error, null, 2)); // Log detailed error information
		throw error;
	}
};

// const deleteReservation = async (id) => {
// 	const deleteResv = await reservationClient.delete({
// 		where: {
// 			id: id,
// 		},
// 	});
// 	return deleteResv;
// };

module.exports = { getAllReservation, deleteReservation };
