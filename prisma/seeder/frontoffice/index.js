const { guestSeed } = require("./guest.seeder");
const { roomBatchSeed } = require("./room");
const { ReservationBatchSeed } = require("./reservation");
const { LogAvailability } = require("./logAvailability.seeder");
const { specialTreatmentSeed } = require("./specialTreatment.seeder");
const { roomChangeSeed } = require("./roomChange.seeder");

async function frontOfficeBatchSeed() {
	await guestSeed();
	await roomBatchSeed();
	await ReservationBatchSeed();
	await LogAvailability();
	await roomChangeSeed();
	await specialTreatmentSeed();
}

module.exports = { frontOfficeBatchSeed };
