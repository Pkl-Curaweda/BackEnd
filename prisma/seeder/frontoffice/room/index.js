const { arrangmentCodeSeed } = require("./arrangmentCode.seeder");
const { roomSeed } = require("./room.seeder");
const { roomCapacitySeed } = require("./roomCapacity.seeder");
const { roomFacilitySeed } = require("./roomFacility.seeder");
const { roomStatusSeed } = require("./roomStatus.seeder");

async function roomBatchSeed() {
  // important to seed in order
  await arrangmentCodeSeed(); // #1
  await roomCapacitySeed(); // #2
  await roomStatusSeed(); // #3
  await roomSeed(); // #4
  await roomFacilitySeed(); // #5
}

module.exports = { roomBatchSeed };
