const { CanceledSeed } = require("./canceledResv.seeder");
const { LogAvailability } = require("./logAvailability.seeder");
const { LogReservation } = require("./logReservation.seeder");

async function LogBatchSeed() {
   await LogReservation();
   await LogAvailability();
   await CanceledSeed();
}

module.exports = { LogBatchSeed }