const { randomInt } = require("crypto");
const { prisma } = require("../../config");
const { ResvRoomSeed } = require("./resvRoom.seeder");
const { guestSeed } = require("../guest.seeder");
const { ResvPaymentSeed } = require("./resvPayment.seeder");
const { countNight } = require("../../../../src/utils/helper");

const reservation = {
	resvStatusId: 1,
	reserverId: 1,
	manyAdult: randomInt(10),
	manyChild: randomInt(10),
	manyBaby: randomInt(10),
	inHouseIndicator: false,
};

async function ReservationSeed() {
	const reserverId = await guestSeed();
	const currentDate = new Date()
	reservation.reserverId = reserverId
	reservation.arrivalDate = currentDate
	const date = new Date(currentDate)
	const manyDay = randomInt(10)
	const departureDate = date.setDate(currentDate.getDate() + manyDay)
	reservation.departureDate = new Date(departureDate)
	reservation.manyNight = countNight(reservation.arrivalDate, reservation.departureDate)
	const resv = await prisma.reservation.create({
		data: reservation,
	});
	await ResvRoomSeed(resv.id)
}
module.exports = { ReservationSeed };
