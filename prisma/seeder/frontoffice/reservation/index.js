const { ReservationSeed } = require("./reservation.seeder");
const { ReserverSeed } = require("./reserver.seeder");
const { ResvRoomSeed } = require("./resvRoom.seeder");
const { ResvQtySeed } = require("./resvQty.seeder");
const { ResvStatusSeed } = require("./resvStatus.seeder");
const { ResvFlightSeed } = require("./resvFlight.seeder");
const { VoucherSeed } = require("./voucher.seeder");
const { CanceledSeed } = require("./canceledResv.seeder");
const { CommentSeed } = require("../comment.seeder");
const { DiscrepancySeed } = require("../discrepancy.seeder");

async function ReservationBatchSeed() {
	// important to seed in order
	await ReserverSeed(); //#3
	await ResvQtySeed(); // #2
	await ResvStatusSeed(); // #1
	await ReservationSeed(); //#4
	await ResvRoomSeed(); //#5
	await ResvFlightSeed(); //#6
	await VoucherSeed(); //#7
	await CanceledSeed(); //#8
	await CommentSeed(); //#9
	await DiscrepancySeed(); //#10
}

module.exports = { ReservationBatchSeed };
