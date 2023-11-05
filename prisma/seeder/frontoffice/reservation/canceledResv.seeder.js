const { prisma } = require("../../config");

const canceled = [
	{
		reservationId: 3,
		guestId: 1,
		resvStatusId: 1,
		argtCode: 123,
		roomId: 1,
		kcard: "abcde",
		arrivalDate: new Date(),
		departureDate: new Date(),
		resvQtyId: 1,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];
async function CanceledSeed() {
	for (let Canceled of canceled) {
		await prisma.canceledReservation.create({
			data: Canceled,
		});
	}
}

module.exports = { CanceledSeed };
