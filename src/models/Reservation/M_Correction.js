const {reservationClient } = require('../Helpers/Config/Front Office/ReservationConfig');
const { PrismaDisconnect } = require('../Helpers/DisconnectPrisma');
const { ThrowError } = require('../Helpers/ThrowError');

//? SORTING LANDPAGE
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

const getReservationById = async (reservationId) => {
	try {
		const reservation = await reservationClient.findFirst({
			where: {
				id: reservationId
			},
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
			}
		});
		return reservation;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

const deleteReservation = async (reservationId) => {
	try {
		await prisma.resvFlight.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.resvRoom.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.deposit.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.logReservation.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.canceledReservation.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.voucher.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.discrepancy.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.cleaningSheet.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.cleanRoom.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.dirtyRoom.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.oooRoom.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.guestPreference.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.task.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		await prisma.roomChange.deleteMany({
			where: {
				reservationId: reservationId,
			},
		});

		const deleteResv = await reservationClient.deleteMany({
			where: {
				id: reservationId,
			},
		});

		return deleteResv;
	} catch (error) {
		console.error("Error deleting reservation:", error);
		console.log("Error details:", JSON.stringify(error, null, 2)); // Log detailed error information
		throw error;
	}
};

//? DATA MODIFY / ADD MODIFY
const addReservation = async (data) => {
	try {
		const reservation = await reservationClient.create({ data })
		return reservation;
	} catch (err) {
		ThrowError(err);
	} finally {
		await PrismaDisconnect();
	}
}

//? EDIT DATA

module.exports = { getAllReservation, getReservationById, deleteReservation, addReservation };