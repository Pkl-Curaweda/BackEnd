const { IdCardSeed } = require("./idCard.seeder");
const { ReservationSeed } = require("./reservation.seeder");
const { ReserverSeed } = require("./reserver.seeder");
const { ResvPaymentSeed } = require("./resvPayment.seeder");
const { ResvRoomSeed } = require("./resvRoom.seeder");
const { ResvStatusSeed } = require("./resvStatus.seeder");

async function ReservationBatchSeed() {
	// important to seed in order
	// await ReserverSeed(); //#3
	await ReservationSeed(); //#4
	// await ResvRoomSeed(); //#5
	// await ResvPaymentSeed();
	// await IdCardSeed();
}

module.exports = { ReservationBatchSeed };
