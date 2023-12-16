const { randomInt } = require("crypto");
const { prisma } = require("../../config");
const { ResvRoomSeed } = require("./resvRoom.seeder");
const { guestSeed } = require("../guest.seeder");
const { ResvPaymentSeed } = require("./resvPayment.seeder");

const reservation = {
	resvStatusId: 1,
	reserverId: 1,
	manyAdult: randomInt(10),
	manyChild: randomInt(10),
	manyBaby: randomInt(10),
	inHouseIndicator: false,
	arrivalDate: new Date(),
	departureDate: new Date(),
	created_at: new Date(),
	updated_at: new Date()
};

const calculateNights = (arrivalDate, departureDate) => {
	const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
	const nights = Math.round(Math.abs((departureDate - arrivalDate) / oneDay));
	return nights;
};

async function ReservationSeed() {
	const reserverId = await guestSeed();
	reservation.reserverId = reserverId
	reservation.manyNight = calculateNights(reservation.arrivalDate, reservation.departureDate)
	const resv = await prisma.reservation.create({
		data: reservation,
	});
	await ResvRoomSeed(resv.id)
	await ResvPaymentSeed(resv.id)
}
module.exports = { ReservationSeed };
