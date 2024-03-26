const { guestSeed } = require("./guest.seeder");
const { roomBatchSeed } = require("./room");
const { ReservationBatchSeed } = require("./reservation");
const { roomChangeSeed } = require("./roomChange.seeder");
const { specialTreatmentSeed } = require("./specialTreatment.seeder");

async function frontOfficeBatchSeed() {
  await ReservationBatchSeed();
  // await roomChangeSeed();
}

module.exports = { frontOfficeBatchSeed };
