const { guestSeed } = require("./guest.seeder");
const { roomBatchSeed } = require("./room");
const { ReservationBatchSeed } = require("./reservation");
const { LogBatchSeed } = require("./logs");
const { DiscrepancySeed } = require("./discrepancy.seeder");
const { CommentSeed } = require("./comment.seeder");

async function frontOfficeBatchSeed() {
	await guestSeed();
	await roomBatchSeed();
	await ReservationBatchSeed();
	await LogBatchSeed();
	await CommentSeed();
	await DiscrepancySeed();
}

module.exports = { frontOfficeBatchSeed };
