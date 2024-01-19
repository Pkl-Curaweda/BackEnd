const { arrangmentCodeSeed } = require("./arrangmentCode.seeder");
const { roomSeed } = require("./room.seeder");
const { roomStatusSeed } = require("./roomStatus.seeder");

async function roomBatchSeed() {
  // important to seed in order
  await arrangmentCodeSeed(); // #1

  await roomStatusSeed(); // #3
  await roomSeed(); // #4
}

module.exports = { roomBatchSeed };
