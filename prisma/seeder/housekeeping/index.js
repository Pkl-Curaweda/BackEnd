const { cleanRoomSeed } = require("./cleanRoom.seeder");
const { departmentSeed } = require("./department.seeder");
const { dirtyRoomSeed } = require("./dirtyRoom.seeder");
const { lostFoundSeed } = require("./lostFound.seeder");
const { maidTaskSeed } = require("./maidTask.seeder");
const { oooRoomSeed } = require("./oooRoom.seeder");
const { StockSeed } = require("./stock.seeder");
const { taskTypeSeed } = require("./taskType.seeder");

async function houseKeepingSeed() {
  await cleanRoomSeed();
  await dirtyRoomSeed();
  await oooRoomSeed();
  await lostFoundSeed();
}

module.exports = { houseKeepingSeed };
