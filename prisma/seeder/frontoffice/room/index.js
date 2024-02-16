const { arrangmentCodeSeed } = require("./arrangmentCode.seeder");
const { roomSeed } = require("./room.seeder");
const { roomStatusSeed } = require("./roomStatus.seeder");
const { roomTypeSeed } = require("./roomType.seeder");

async function roomBatchSeed() {
  // important to seed in order
  await roomTypeSeed();
  await arrangmentCodeSeed();
  
  await roomStatusSeed(); // #3
  await roomSeed(); // #4
}

module.exports = { roomBatchSeed };
