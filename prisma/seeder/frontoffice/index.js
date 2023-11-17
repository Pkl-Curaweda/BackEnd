const { guestSeed } = require("./guest.seeder");
const { roomBatchSeed } = require("./room");
const { ReservationBatchSeed } = require("./reservation");
const { LogAvailability } = require("./logAvailability.seeder");

async function frontOfficeBatchSeed() {
	await guestSeed();
	await roomBatchSeed();
	await ReservationBatchSeed();
	await LogAvailability();
}

module.exports = { frontOfficeBatchSeed };
